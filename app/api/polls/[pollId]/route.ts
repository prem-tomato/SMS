// app/api/polls/[pollId]/route.ts
import {
  commitTransaction,
  rollbackTransaction,
  startTransaction,
  Transaction,
} from "@/db/configs/acid";
import { query, queryWithClient } from "@/db/database-connect";
import { NextRequest, NextResponse } from "next/server";
import { findUserById } from "../../auth/auth.model";

// GET - Get specific poll with options and vote counts
export async function GET(
  request: NextRequest,
  { params }: { params: { pollId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const queryText = `
      SELECT 
        p.*,
        CASE WHEN pv.user_id IS NOT NULL THEN true ELSE false END as user_has_voted,
        pv.poll_option_id as user_voted_option_id,
        json_agg(
          json_build_object(
            'id', po.id,
            'option_text', po.option_text,
            'option_order', po.option_order,
            'vote_count', COALESCE(vote_counts.count, 0)
          ) ORDER BY po.option_order
        ) as options
      FROM polls p
      LEFT JOIN poll_votes pv ON p.id = pv.poll_id AND pv.user_id = $2
      LEFT JOIN poll_options po ON p.id = po.poll_id AND po.is_deleted = false
      LEFT JOIN (
        SELECT poll_option_id, COUNT(*) as count
        FROM poll_votes
        GROUP BY poll_option_id
      ) vote_counts ON po.id = vote_counts.poll_option_id
      WHERE p.id = $1 AND p.is_deleted = false
      GROUP BY p.id, pv.user_id, pv.poll_option_id
    `;

    const result = await query(queryText, [params.pollId, userId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching poll:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// api/polls/[pollId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { pollId: string } }
) {
  const transaction: Transaction = await startTransaction();
  const { client } = transaction;
  try {
    const userId = request.headers.get("userId")!;

    const user = await findUserById(userId);
    if (!user) {
      await rollbackTransaction(transaction);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const queries = [
      `
        UPDATE polls
        SET is_deleted = true,
            deleted_at = NOW(),
            deleted_by = $2,
            updated_at = NOW(),
            updated_by = $2
        WHERE id = $1
      `,
      `
        UPDATE poll_votes
        SET is_deleted = true,
            deleted_at = NOW(),
            deleted_by = $2,
            updated_at = NOW(),
            updated_by = $2
        WHERE poll_id = $1
      `,
      `
        UPDATE poll_options
        SET is_deleted = true,
            deleted_at = NOW(),
            deleted_by = $2,
            updated_at = NOW(),
            updated_by = $2
        WHERE poll_id = $1
      `,
    ];

    for (const sql of queries) {
      await queryWithClient(client, sql, [params.pollId, userId]);
    }

    await commitTransaction(transaction);

    return NextResponse.json({ message: "Poll deleted successfully" });
  } catch (error) {
    console.error("Error deleting poll:", error);

    await rollbackTransaction(transaction);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// app/api/polls/route.ts
import { Transaction, startTransaction } from "@/db/configs/acid";
import { query } from "@/db/database-connect";
import { NextRequest, NextResponse } from "next/server";

// GET - Get all polls for a society
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const societyId = searchParams.get("societyId");
    const userId = searchParams.get("userId");

    if (!societyId) {
      return NextResponse.json(
        { error: "Society ID is required" },
        { status: 400 }
      );
    }

    // Update expired polls first
    await query("SELECT update_expired_polls()");

    // FIXED: Include poll options and vote counts
    const queryText = `
      SELECT 
        p.id,
        p.title,
        p.description,
        p.expires_at,
        p.status,
        p.created_at,
        CASE WHEN pv.user_id IS NOT NULL THEN true ELSE false END as user_has_voted,
        pv.poll_option_id as user_voted_option_id,
        COALESCE(total_votes.total, 0) as total_votes,
        json_agg(
          json_build_object(
            'id', po.id,
            'option_text', po.option_text,
            'option_order', po.option_order,
            'vote_count', COALESCE(vote_counts.count, 0),
            'percentage', ROUND(
              (COALESCE(vote_counts.count, 0)::decimal / NULLIF(total_votes.total, 0)) * 100, 2
            )
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
      LEFT JOIN (
        SELECT poll_id, COUNT(*) as total
        FROM poll_votes
        GROUP BY poll_id
      ) total_votes ON p.id = total_votes.poll_id
      WHERE p.society_id = $1 AND p.is_deleted = false
      GROUP BY p.id, p.title, p.description, p.expires_at, p.status, p.created_at, pv.user_id, pv.poll_option_id, total_votes.total
      ORDER BY p.created_at DESC
    `;

    const result = await query(queryText, [societyId, userId]);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching polls:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new poll (admin only)
export async function POST(request: NextRequest) {
  const transaction: Transaction = await startTransaction();
  const { client } = transaction;
  try {
    const body = await request.json();
    const {
      societyId,
      title,
      description,
      expiresAt,
      options,
      createdBy,
      userRole,
    } = body;

    console.log("body", body);

    // Check if user is admin
    if (userRole !== "admin") {
      return NextResponse.json(
        { error: "Only admins can create polls" },
        { status: 403 }
      );
    }

    if (!title || !expiresAt || !options || options.length < 2) {
      return NextResponse.json(
        {
          error: "Title, expiry date, and at least 2 options are required",
        },
        { status: 400 }
      );
    }

    try {
      await client.query("BEGIN");

      // Create poll
      const pollQuery = `
        INSERT INTO polls (society_id, title, description, expires_at, created_by, updated_by)
        VALUES ($1, $2, $3, $4, $5, $5)
        RETURNING *
      `;
      const pollResult = await client.query(pollQuery, [
        societyId,
        title,
        description,
        expiresAt,
        createdBy,
      ]);

      const pollId = pollResult.rows[0].id;

      // Create poll options
      for (let i = 0; i < options.length; i++) {
        const optionQuery = `
          INSERT INTO poll_options (poll_id, option_text, option_order, created_by, updated_by)
          VALUES ($1, $2, $3, $4, $4)
        `;
        await client.query(optionQuery, [pollId, options[i], i + 1, createdBy]);
      }

      await client.query("COMMIT");
      return NextResponse.json(pollResult.rows[0], { status: 201 });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error creating poll:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

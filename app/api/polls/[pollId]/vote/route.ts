// app/api/polls/[pollId]/vote/route.ts
import { startTransaction, Transaction } from "@/db/configs/acid";
import { NextRequest, NextResponse } from "next/server";

// POST - Vote on a poll
export async function POST(
  request: NextRequest,
  { params }: { params: { pollId: string } }
) {
  const transaction: Transaction = await startTransaction();
  const { client } = transaction;

  try {
    const body = await request.json();
    const { optionId, userId } = body;

    if (!optionId || !userId) {
      return NextResponse.json(
        {
          error: "Option ID and User ID are required",
        },
        { status: 400 }
      );
    }

    try {
      await client.query("BEGIN");

      // Check if poll exists and is active
      const pollCheck = await client.query(
        `
        SELECT id, expires_at, status 
        FROM polls 
        WHERE id = $1 AND is_deleted = false
      `,
        [params.pollId]
      );

      if (pollCheck.rows.length === 0) {
        return NextResponse.json({ error: "Poll not found" }, { status: 404 });
      }

      const poll = pollCheck.rows[0];
      const now = new Date();
      const expiresAt = new Date(poll.expires_at);

      if (poll.status !== "active" || expiresAt <= now) {
        return NextResponse.json(
          { error: "Poll is not active or has expired" },
          { status: 400 }
        );
      }

      // Check if user already voted
      const existingVote = await client.query(
        `
        SELECT id FROM poll_votes 
        WHERE poll_id = $1 AND user_id = $2
      `,
        [params.pollId, userId]
      );

      if (existingVote.rows.length > 0) {
        return NextResponse.json(
          {
            error: "You have already voted on this poll",
          },
          { status: 400 }
        );
      }

      // Verify the option belongs to this poll
      const optionCheck = await client.query(
        `
        SELECT id FROM poll_options 
        WHERE id = $1 AND poll_id = $2 AND is_deleted = false
      `,
        [optionId, params.pollId]
      );

      if (optionCheck.rows.length === 0) {
        return NextResponse.json({ error: "Invalid option" }, { status: 400 });
      }

      // Create the vote
      const voteQuery = `
        INSERT INTO poll_votes (poll_id, poll_option_id, user_id)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      const voteResult = await client.query(voteQuery, [
        params.pollId,
        optionId,
        userId,
      ]);

      await client.query("COMMIT");
      return NextResponse.json(voteResult.rows[0], { status: 201 });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error voting on poll:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

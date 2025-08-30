// lib/polling.ts - Utility functions for polling

import { Transaction, startTransaction } from "@/db/configs/acid";
import pool, { query } from "@/db/database-connect";

export interface CreatePollData {
  societyId: string;
  title: string;
  description?: string;
  expiresAt: string;
  options: string[];
  createdBy: string;
}

export interface PollVoteData {
  pollId: string;
  optionId: string;
  userId: string;
}

export class PollService {
  static async createPoll(data: CreatePollData) {
    const transaction: Transaction = await startTransaction();
    const { client } = transaction;

    try {
      await client.query("BEGIN");

      // Create poll
      const pollQuery = `
        INSERT INTO polls (society_id, title, description, expires_at, created_by, updated_by)
        VALUES ($1, $2, $3, $4, $5, $5)
        RETURNING *
      `;
      const pollResult = await client.query(pollQuery, [
        data.societyId,
        data.title,
        data.description,
        data.expiresAt,
        data.createdBy,
      ]);

      const pollId = pollResult.rows[0].id;

      // Create poll options
      const optionPromises = data.options.map((option, index) => {
        const optionQuery = `
          INSERT INTO poll_options (poll_id, option_text, option_order, created_by, updated_by)
          VALUES ($1, $2, $3, $4, $4)
        `;
        return client.query(optionQuery, [
          pollId,
          option,
          index + 1,
          data.createdBy,
        ]);
      });

      await Promise.all(optionPromises);
      await client.query("COMMIT");

      return pollResult.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  static async votePoll(data: PollVoteData) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Check if poll is still active
      const pollCheck = await client.query(
        `
        SELECT id, expires_at, status 
        FROM polls 
        WHERE id = $1 AND is_deleted = false
      `,
        [data.pollId]
      );

      if (pollCheck.rows.length === 0) {
        throw new Error("Poll not found");
      }

      const poll = pollCheck.rows[0];
      if (poll.status !== "active" || new Date(poll.expires_at) <= new Date()) {
        throw new Error("Poll is not active or has expired");
      }

      // Check if user already voted
      const existingVote = await client.query(
        `
        SELECT id FROM poll_votes 
        WHERE poll_id = $1 AND user_id = $2
      `,
        [data.pollId, data.userId]
      );

      if (existingVote.rows.length > 0) {
        throw new Error("User has already voted");
      }

      // Verify option belongs to poll
      const optionCheck = await client.query(
        `
        SELECT id FROM poll_options 
        WHERE id = $1 AND poll_id = $2 AND is_deleted = false
      `,
        [data.optionId, data.pollId]
      );

      if (optionCheck.rows.length === 0) {
        throw new Error("Invalid option");
      }

      // Create vote
      const voteQuery = `
        INSERT INTO poll_votes (poll_id, poll_option_id, user_id)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      const voteResult = await client.query(voteQuery, [
        data.pollId,
        data.optionId,
        data.userId,
      ]);

      await client.query("COMMIT");
      return voteResult.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  static async getPollsForSociety(societyId: string, userId?: string) {
    // Update expired polls first
    await pool.query("SELECT update_expired_polls()");

    const queryText = `
      SELECT 
        p.*,
        CASE WHEN pv.user_id IS NOT NULL THEN true ELSE false END as user_has_voted,
        pv.poll_option_id as user_voted_option_id,
        (SELECT COUNT(*) FROM poll_votes WHERE poll_id = p.id) as total_votes
      FROM polls p
      LEFT JOIN poll_votes pv ON p.id = pv.poll_id AND pv.user_id = $2
      WHERE p.society_id = $1 AND p.is_deleted = false
      ORDER BY p.created_at DESC
    `;

    const result = await pool.query(queryText, [societyId, userId]);
    return result.rows;
  }

  static async getPollWithDetails(pollId: string, userId?: string) {
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
        ) as options,
        (SELECT COUNT(*) FROM poll_votes WHERE poll_id = p.id) as total_votes
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

    const result = await query(queryText, [pollId, userId]);
    return result.rows[0] || null;
  }

  static async closePoll(pollId: string, updatedBy: string) {
    const queryText = `
      UPDATE polls 
      SET status = 'closed', updated_by = $2, updated_at = now()
      WHERE id = $1 AND is_deleted = false
      RETURNING *
    `;

    const result = await query(queryText, [pollId, updatedBy]);
    return result.rows[0] || null;
  }

  static async deletePoll(pollId: string, deletedBy: string) {
    const queryText = `
      UPDATE polls 
      SET is_deleted = true, deleted_by = $2, deleted_at = now()
      WHERE id = $1
      RETURNING *
    `;

    const result = await query(queryText, [pollId, deletedBy]);
    return result.rows[0] || null;
  }
}

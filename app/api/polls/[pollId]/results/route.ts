// app/api/polls/[pollId]/results/route.ts
import { query } from '@/db/database-connect';
import { NextRequest, NextResponse } from 'next/server';


// GET - Get poll results
export async function GET(
  request: NextRequest,
  { params }: { params: { pollId: string } }
) {
  try {
    const queryText = `
      SELECT 
        p.id,
        p.title,
        p.description,
        p.expires_at,
        p.status,
        p.created_at,
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
        ) as options,
        total_votes.total as total_votes
      FROM polls p
      LEFT JOIN poll_options po ON p.id = po.poll_id AND po.is_deleted = false
      LEFT JOIN (
        SELECT poll_option_id, COUNT(*) as count
        FROM poll_votes
        GROUP BY poll_option_id
      ) vote_counts ON po.id = vote_counts.poll_option_id
      LEFT JOIN (
        SELECT poll_id, COUNT(*) as total
        FROM poll_votes
        WHERE poll_id = $1
        GROUP BY poll_id
      ) total_votes ON p.id = total_votes.poll_id
      WHERE p.id = $1 AND p.is_deleted = false
      GROUP BY p.id, total_votes.total
    `;

    const result = await query(queryText, [params.pollId]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching poll results:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
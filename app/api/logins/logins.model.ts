import { query } from "@/db/database-connect";
import { QueryResult } from "pg";
import { LoginsResponse } from "./logins.controller";

export const getLoginsList = async (
  societyId?: string
): Promise<LoginsResponse[]> => {
  try {
    const values: any[] = [];
    let whereClause: string = "";
    if (societyId) {
      whereClause = `AND u.society_id = $1`;
      values.push(societyId);
    }

    const queryText = `
      SELECT 
        l.id,
        concat(u.first_name, ' ', u.last_name) AS user_name,
        l.created_at AS login_time,
        l.ip_address AS login_ip,
        l.device AS device,
        l.os AS os,
        l.browser AS browser,
        l.latitude AS latitude,
        l.longitude AS longitude, 
        l.location AS location
      FROM 
      user_sessions l
        LEFT JOIN users u ON l.user_id = u.id
      WHERE l.is_deleted = false ${whereClause}
    `;

    const res: QueryResult<LoginsResponse> = await query<LoginsResponse>(
      queryText,
      values
    );
    return res.rows;
  } catch (error) {
    throw new Error(`Error getting logins list: ${error}`);
  }
};

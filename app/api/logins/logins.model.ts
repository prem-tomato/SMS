import { query } from "@/db/database-connect";
import { QueryResult } from "pg";
import { LoginsResponse } from "./logins.controller";

export const getLoginsList = async (): Promise<LoginsResponse[]> => {
  try {
    const queryText = `
      SELECT 
        l.id,
        concat(u.first_name, ' ', u.last_name) AS user_name,
        l.created_at AS login_time,
        l.ip_address AS login_ip,
        l.device AS device,
        l.os AS os,
        l.browser AS browser
      FROM 
      user_sessions l
        LEFT JOIN users u ON l.user_id = u.id
    `;

    const res: QueryResult<LoginsResponse> = await query<LoginsResponse>(
      queryText
    );
    return res.rows;
  } catch (error) {
    throw new Error(`Error getting logins list: ${error}`);
  }
};

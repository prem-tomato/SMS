import { query } from "@/db/database-connect";
import { QueryResult } from "pg";

export const getDues = async (): Promise<{ month_year: string[] }> => {
  try {
    const queryText = `
      SELECT DISTINCT TO_CHAR(DATE_TRUNC('month', month_year), 'YYYY-MM-DD') AS month_year
      FROM member_monthly_maintenance_dues
      ORDER BY month_year DESC;
    `;

    const res: QueryResult<{ month_year: string }> = await query<{
      month_year: string;
    }>(queryText);

    return {
      month_year: res.rows.map((row) => row.month_year),
    };
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch dues");
  }
};

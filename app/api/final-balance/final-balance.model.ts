import { query } from "@/db/database-connect";
import { QueryResult } from "pg";
import { FinalBalanceResponse } from "./final-balance.types";

export const getFinalBalance = async (
    societyId: string
  ): Promise<FinalBalanceResponse> => {
    try {
      const queryText = `
        SELECT
          s.name AS society_name,
          s.opening_balance AS society_balance,
          COALESCE(expense_data.total_expense, 0) AS total_expense,
          COALESCE(maintenance_data.total_maintenance, 0) AS total_maintenance,
          (
            s.opening_balance
            - COALESCE(expense_data.total_expense, 0)
            + COALESCE(maintenance_data.total_maintenance, 0)
          )::int AS final_balance
        FROM societies s
        LEFT JOIN (
          SELECT society_id, SUM(expense_amount)::int AS total_expense
          FROM expense_tracking
          WHERE is_deleted = false
          GROUP BY society_id
        ) AS expense_data ON expense_data.society_id = s.id
        LEFT JOIN (
          SELECT society_id, SUM(current_maintenance)::int AS total_maintenance
          FROM flats
          GROUP BY society_id
        ) AS maintenance_data ON maintenance_data.society_id = s.id
        WHERE s.id = $1
      `;
  
      const res: QueryResult<FinalBalanceResponse> =
        await query<FinalBalanceResponse>(queryText, [societyId]);
  
      return res.rows[0];
    } catch (error) {
      throw new Error(`Error getting final balance: ${error}`);
    }
  };
  
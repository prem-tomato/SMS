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
  COALESCE(flat_maintenance.raw_maintenance_amount, 0) + COALESCE(penalty_data.total_penalties, 0) AS total_maintenance,
  COALESCE(penalty_data.total_penalties, 0) AS total_penalties,
  COALESCE(flat_maintenance.raw_maintenance_amount, 0) AS raw_maintenance_amount,
  (
    s.opening_balance
    - COALESCE(expense_data.total_expense, 0)
    + COALESCE(flat_maintenance.raw_maintenance_amount, 0)
    + COALESCE(penalty_data.total_penalties, 0)
  ) AS final_balance
FROM societies s
LEFT JOIN (
  SELECT 
    society_id, 
    SUM(expense_amount)::int AS total_expense
  FROM expense_tracking
  GROUP BY society_id
) AS expense_data ON expense_data.society_id = s.id
LEFT JOIN (
  SELECT
    society_id,
    SUM(current_maintenance)::int AS raw_maintenance_amount
  FROM flats
  GROUP BY society_id
) AS flat_maintenance ON flat_maintenance.society_id = s.id
LEFT JOIN (
  SELECT
    f.society_id,
    SUM(fp.amount)::int AS total_penalties
  FROM flat_penalties fp
  INNER JOIN flats f ON f.id = fp.flat_id
  WHERE fp.is_deleted = false
  GROUP BY f.society_id
) AS penalty_data ON penalty_data.society_id = s.id
WHERE s.id = $1;

    `;

    const res: QueryResult<FinalBalanceResponse> =
      await query<FinalBalanceResponse>(queryText, [societyId]);

    return res.rows[0];
  } catch (error) {
    throw new Error(`Error getting final balance: ${error}`);
  }
};

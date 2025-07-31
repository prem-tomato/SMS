import { query } from "@/db/database-connect";
import { QueryResult } from "pg";
import { FinalBalanceResponse } from "./final-balance.types";

// export const getFinalBalance = async (
//   societyId: string
// ): Promise<FinalBalanceResponse> => {
//   try {
//     // doing everything with current month
//     // for final balance add income
//     // income and expense as based on current month
//     // maintenance as based on current month YYYY-MM-01
//     // add new row income based on current month
//     const queryText = `
// SELECT
//   s.name AS society_name,
//   s.opening_balance AS society_balance,
//   COALESCE(expense_data.total_expense, 0) AS total_expense,
//   COALESCE(flat_maintenance.raw_maintenance_amount, 0) + COALESCE(penalty_data.total_penalties, 0) AS total_maintenance,
//   COALESCE(penalty_data.total_penalties, 0) AS total_penalties,
//   COALESCE(flat_maintenance.raw_maintenance_amount, 0) AS raw_maintenance_amount,
//   (
//     s.opening_balance
//     - COALESCE(expense_data.total_expense, 0)
//     + COALESCE(flat_maintenance.raw_maintenance_amount, 0)
//     + COALESCE(penalty_data.total_penalties, 0)
//   ) AS final_balance
// FROM societies s
// LEFT JOIN (
//   SELECT
//     society_id,
//     SUM(expense_amount)::int AS total_expense
//   FROM expense_tracking
//   GROUP BY society_id
// ) AS expense_data ON expense_data.society_id = s.id
// LEFT JOIN (
//   SELECT
//     society_id,
//     SUM(maintenance_amount)::int AS raw_maintenance_amount
//   FROM member_monthly_maintenance_dues
//   WHERE month_year = CURRENT_DATE(YYYY-MM-01) AND maintenance_paid = true
//   GROUP BY society_id
// ) AS flat_maintenance ON flat_maintenance.society_id = s.id
// LEFT JOIN (
//   SELECT
//     f.society_id,
//     SUM(fp.amount)::int AS total_penalties
//   FROM flat_penalties fp
//   INNER JOIN flats f ON f.id = fp.flat_id
//   WHERE fp.is_deleted = false
//   GROUP BY f.society_id
// ) AS penalty_data ON penalty_data.society_id = s.id
// WHERE s.id = $1;

//     `;

//     const res: QueryResult<FinalBalanceResponse> =
//       await query<FinalBalanceResponse>(queryText, [societyId]);

//     return res.rows[0];
//   } catch (error) {
//     throw new Error(`Error getting final balance: ${error}`);
//   }
// };

export const getFinalBalance = async (
  societyId: string
): Promise<FinalBalanceResponse> => {
  try {
    const queryText = `
SELECT
  s.name AS society_name,
  s.opening_balance AS society_balance,
  COALESCE(expense_data.total_expense, 0) AS total_expense,
  COALESCE(income_data.total_income, 0) AS total_income,
  COALESCE(regular_maintenance.regular_maintenance_amount, 0) AS regular_maintenance_amount,
  COALESCE(pending_maintenance.pending_collected_maintenances, 0) AS pending_collected_maintenances,
  COALESCE(penalty_data.total_penalties_paid_current_month, 0) AS total_penalties_paid_current_month,
  (
    s.opening_balance
    + COALESCE(income_data.total_income, 0)
    + COALESCE(regular_maintenance.regular_maintenance_amount, 0)
    + COALESCE(pending_maintenance.pending_collected_maintenances, 0)
    + COALESCE(penalty_data.total_penalties_paid_current_month, 0)
    - COALESCE(expense_data.total_expense, 0)
  ) AS final_balance
FROM societies s
LEFT JOIN (
  SELECT 
    society_id, 
    SUM(expense_amount)::int AS total_expense
  FROM expense_tracking
  WHERE expense_month = EXTRACT(MONTH FROM CURRENT_DATE)::int2
    AND expense_year = EXTRACT(YEAR FROM CURRENT_DATE)::int2
    AND is_deleted = false
  GROUP BY society_id
) AS expense_data ON expense_data.society_id = s.id
LEFT JOIN (
  SELECT 
    society_id, 
    SUM(income_amount)::int AS total_income
  FROM income_tracking
  WHERE income_month = EXTRACT(MONTH FROM CURRENT_DATE)::int2
    AND income_year = EXTRACT(YEAR FROM CURRENT_DATE)::int2
    AND is_deleted = false
  GROUP BY society_id
) AS income_data ON income_data.society_id = s.id
-- Regular Monthly Maintenance (member_monthly_maintenance_dues)
LEFT JOIN (
  SELECT
    society_id,
    SUM(maintenance_amount)::int AS regular_maintenance_amount
  FROM member_monthly_maintenance_dues
  WHERE month_year = DATE_TRUNC('month', CURRENT_DATE)::date
    AND maintenance_paid = true
  GROUP BY society_id
) AS regular_maintenance ON regular_maintenance.society_id = s.id
-- Pending/Collected Maintenances (flat_maintenances -> settlements/monthly)



LEFT JOIN (
  SELECT
    fm.society_id,
    SUM(
      COALESCE(settlements.settlement_amount, 0) + 
      COALESCE(monthly.monthly_amount, 0)
    )::int AS pending_collected_maintenances
  FROM flat_maintenances fm
  LEFT JOIN (
    SELECT 
      maintenance_id,
      SUM(settlement_amount) AS settlement_amount
    FROM flat_maintenance_settlements
    WHERE is_paid = true
      AND DATE_TRUNC('month', paid_at) = DATE_TRUNC('month', CURRENT_DATE)
    GROUP BY maintenance_id
  ) AS settlements ON settlements.maintenance_id = fm.id
  LEFT JOIN (
    SELECT 
      maintenance_id,
      SUM(amount) AS monthly_amount
    FROM flat_maintenance_monthly
    WHERE is_paid = true
      AND DATE_TRUNC('month', paid_at) = DATE_TRUNC('month', CURRENT_DATE)
    GROUP BY maintenance_id
  ) AS monthly ON monthly.maintenance_id = fm.id
  WHERE fm.is_deleted = false
    AND fm.society_id IS NOT NULL
    AND (settlements.settlement_amount IS NOT NULL OR monthly.monthly_amount IS NOT NULL)
  GROUP BY fm.society_id
) AS pending_maintenance ON pending_maintenance.society_id = s.id





-- Penalties paid in current month only
LEFT JOIN (
  SELECT
    f.society_id,
    SUM(fp.amount)::int AS total_penalties_paid_current_month
  FROM flat_penalties fp
  INNER JOIN flats f ON f.id = fp.flat_id
  WHERE fp.is_deleted = false
    AND fp.is_paid = true
    AND DATE_TRUNC('month', fp.paid_at) = DATE_TRUNC('month', CURRENT_DATE)
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

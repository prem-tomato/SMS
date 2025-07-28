import { query } from "@/db/database-connect";
import { QueryResult } from "pg";
import { GetMemberMonthlyDuesResponse } from "./member-monthly-dues.types";

export const listMemberMonthlyDues = async (
  monthYear: string,
  societyId?: string
): Promise<GetMemberMonthlyDuesResponse[]> => {
  try {
    const values: any[] = [monthYear];

    let whereClause: string = "";
    if (societyId) {
      whereClause = `AND mmd.society_id = $2`;
      values.push(societyId);
    }

    const queryText = `
      SELECT
    mmd.id,
    mmd.society_id,
    mmd.building_id,
    mmd.flat_id,
    mmd.member_ids,
    mmd.month_year,
    mmd.maintenance_amount,
    mmd.penalty_amount,
    mmd.total_due,
    mmd.maintenance_paid,
    mmd.maintenance_paid_at,
    mmd.penalty_paid,
    mmd.penalty_paid_at,
    s.name AS society_name,
    b.name AS building_name,
    f.flat_number,
    json_agg(mu.first_name || ' ' || mu.last_name) AS member_name, -- ✅ correct source for member names
    CONCAT(u.first_name, ' ', u.last_name) AS action_by,
    mmd.updated_at AS action_at
FROM member_monthly_dues mmd
INNER JOIN members m ON m.id = ANY(mmd.member_ids)
INNER JOIN users mu ON mu.id = m.user_id -- ✅ user who is the actual member
INNER JOIN flats f ON mmd.flat_id = f.id
INNER JOIN societies s ON mmd.society_id = s.id
INNER JOIN buildings b ON mmd.building_id = b.id
INNER JOIN users u ON mmd.updated_by = u.id -- ✅ user who performed the update
WHERE mmd.month_year = $1 ${whereClause}
GROUP BY
    mmd.id,
    mmd.society_id,
    mmd.building_id,
    mmd.flat_id,
    mmd.member_ids,
    mmd.month_year,
    mmd.maintenance_amount,
    mmd.penalty_amount,
    mmd.total_due,
    mmd.maintenance_paid,
    mmd.maintenance_paid_at,
    mmd.penalty_paid,
    mmd.penalty_paid_at,
    s.name,
    b.name,
    f.flat_number,
    mmd.updated_at,
    u.first_name,
    u.last_name;

    `;

    const result: QueryResult<GetMemberMonthlyDuesResponse> =
      await query<GetMemberMonthlyDuesResponse>(queryText, values);

    return result.rows;
  } catch (error) {
    throw new Error(`Error in listMemberMonthlyDues: ${error}`);
  }
};

export const getRecordMemberMonthlyDues = async (
  recordId: string
): Promise<GetMemberMonthlyDuesResponse> => {
  try {
    const queryText = `
      SELECT
          mmd.id,
          mmd.society_id,
          mmd.building_id,
          mmd.flat_id,
          mmd.member_ids,
          TO_CHAR(mmd.month_year, 'YYYY-MM-DD') AS month_year,
          mmd.maintenance_amount,
          mmd.penalty_amount,
          mmd.total_due,
          mmd.maintenance_paid,
          mmd.maintenance_paid_at,
          mmd.penalty_paid,
          mmd.penalty_paid_at,
          s.name AS society_name,
          b.name AS building_name,
          f.flat_number,
          json_agg(mu.first_name || ' ' || mu.last_name) AS member_name, -- ✅ correct source for member names
          CONCAT(u.first_name, ' ', u.last_name) AS action_by,
          mmd.updated_at AS action_at
      FROM member_monthly_dues mmd
      INNER JOIN members m ON m.id = ANY(mmd.member_ids)
      INNER JOIN users mu ON mu.id = m.user_id -- ✅ user who is the actual member
      INNER JOIN flats f ON mmd.flat_id = f.id
      INNER JOIN societies s ON mmd.society_id = s.id
      INNER JOIN buildings b ON mmd.building_id = b.id
      INNER JOIN users u ON mmd.updated_by = u.id -- ✅ user who performed the update
      WHERE mmd.id = $1
      GROUP BY
          mmd.id,
          mmd.society_id,
          mmd.building_id,
          mmd.flat_id,
          mmd.member_ids,
          mmd.month_year,
          mmd.maintenance_amount,
          mmd.penalty_amount,
          mmd.total_due,
          mmd.maintenance_paid,
          mmd.maintenance_paid_at,
          mmd.penalty_paid,
          mmd.penalty_paid_at,
          s.name,
          b.name,
          f.flat_number,
          mmd.updated_at,
          u.first_name,
          u.last_name;
    `;

    const result: QueryResult<GetMemberMonthlyDuesResponse> =
      await query<GetMemberMonthlyDuesResponse>(queryText, [recordId]);

      console.log(result.rows[0]);

    return result.rows[0];
  } catch (error) {
    throw new Error(`Error in listMemberMonthlyDues: ${error}`);
  }
};

import { query } from "@/db/database-connect";
import { QueryResult } from "pg";
import {
  BulkMonetizeReqBody,
  GetMemberMonthlyDuesResponse,
} from "./member-monthly-dues.types";

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
        mmd.housing_id,
        mmd.member_ids,
        TO_CHAR(mmd.month_year, 'YYYY-MM-DD') AS month_year,
        mmd.maintenance_amount,
        mmd.maintenance_paid,
        mmd.maintenance_paid_at,
        s.name AS society_name,
        b.name AS building_name,
        f.flat_number,
        h.unit_number AS housing_unit_number,
        CASE
          WHEN f.flat_number IS NOT NULL THEN 'flat'
          WHEN h.unit_number IS NOT NULL THEN 'housing'
          ELSE 'unknown'
        END AS property_type,
        COALESCE(f.flat_number, h.unit_number) AS unit_identifier,
        json_agg(mu.first_name || ' ' || mu.last_name) AS member_name,
        CONCAT(u.first_name, ' ', u.last_name) AS action_by,
        mmd.updated_at AS action_at
      FROM member_monthly_maintenance_dues mmd
      INNER JOIN members m ON m.id = ANY(mmd.member_ids)
      INNER JOIN users mu ON mu.id = m.user_id
      LEFT JOIN flats f ON mmd.flat_id = f.id
      LEFT JOIN buildings b ON mmd.building_id = b.id
      LEFT JOIN housing_units h ON mmd.housing_id = h.id
      INNER JOIN societies s ON mmd.society_id = s.id
      INNER JOIN users u ON mmd.updated_by = u.id
      WHERE mmd.month_year = $1 ${whereClause}
      GROUP BY
        mmd.id, mmd.society_id, mmd.building_id, mmd.flat_id, mmd.housing_id,
        mmd.member_ids, mmd.month_year, mmd.maintenance_amount,
        mmd.maintenance_paid, mmd.maintenance_paid_at, s.name,
        b.name, f.flat_number, h.unit_number, u.first_name, u.last_name,
        mmd.updated_at;
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
        mmd.housing_id,
        mmd.member_ids,
        TO_CHAR(mmd.month_year, 'YYYY-MM-DD') AS month_year,
        mmd.maintenance_amount,
        mmd.maintenance_paid,
        mmd.maintenance_paid_at,
        s.name AS society_name,
        b.name AS building_name,
        f.flat_number,
        h.unit_number AS housing_unit_number,
        CASE
          WHEN f.flat_number IS NOT NULL THEN 'flat'
          WHEN h.unit_number IS NOT NULL THEN 'housing'
          ELSE 'unknown'
        END AS property_type,
        COALESCE(f.flat_number, h.unit_number) AS unit_identifier,
        json_agg(mu.first_name || ' ' || mu.last_name) AS member_name,
        CONCAT(u.first_name, ' ', u.last_name) AS action_by,
        mmd.updated_at AS action_at
      FROM member_monthly_maintenance_dues mmd
      INNER JOIN members m ON m.id = ANY(mmd.member_ids)
      INNER JOIN users mu ON mu.id = m.user_id
      LEFT JOIN flats f ON mmd.flat_id = f.id
      LEFT JOIN housing_units h ON mmd.housing_id = h.id
      LEFT JOIN buildings b ON mmd.building_id = b.id
      INNER JOIN societies s ON mmd.society_id = s.id
      INNER JOIN users u ON mmd.updated_by = u.id
      WHERE mmd.id = $1
      GROUP BY
        mmd.id,
        mmd.society_id,
        mmd.building_id,
        mmd.flat_id,
        mmd.housing_id,
        mmd.member_ids,
        mmd.month_year,
        mmd.maintenance_amount,
        mmd.maintenance_paid,
        mmd.maintenance_paid_at,
        s.name,
        b.name,
        f.flat_number,
        h.unit_number,
        u.first_name,
        u.last_name,
        mmd.updated_at;
    `;

    const result: QueryResult<GetMemberMonthlyDuesResponse> =
      await query<GetMemberMonthlyDuesResponse>(queryText, [recordId]);

    return result.rows[0];
  } catch (error) {
    throw new Error(`Error in getRecordMemberMonthlyDues: ${error}`);
  }
};

export const bulkMonetize = async (
  reqBody: BulkMonetizeReqBody,
  userId: string
): Promise<void> => {
  try {
    const queryText = `
      UPDATE member_monthly_maintenance_dues
      SET 
        maintenance_paid = TRUE,
        maintenance_paid_at = NOW(),
        updated_by = $1,
        updated_at = NOW()
      WHERE id = ANY($2)
    `;

    await query(queryText, [userId, reqBody.ids]);
  } catch (error) {
    throw new Error(`Error bulk monetizing flat: ${error}`);
  }
};

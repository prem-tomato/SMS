import { query } from "@/db/database-connect";
import { QueryResult } from "pg";
import { AssignedMemberResponse } from "./assigned-members.types";

export const listAllAssignedMembers = async (
  societyId?: string
): Promise<AssignedMemberResponse[]> => {
  try {
    const values: any[] = [];
    let whereClause: string = "";

    if (societyId) {
      values.push(societyId);
      whereClause = `WHERE a.society_id = $1`;
    }

    const queryText: string = `
            WITH user_base AS (
                SELECT DISTINCT
                    a.user_id,
                    MIN(a.move_in_date) as move_in_date,
                    (array_agg(a.created_by ORDER BY a.created_at))[1] as created_by,
                    MIN(a.created_at) as created_at,
                    CONCAT(u.first_name, ' ', u.last_name) AS member_name,
                    s.name AS society_name,
                    b.name AS building_name
                FROM members a
                LEFT JOIN users u ON u.id = a.user_id
                LEFT JOIN societies s ON s.id = a.society_id
                LEFT JOIN buildings b ON b.id = a.building_id
                ${whereClause}
                GROUP BY 
                    a.user_id, 
                    u.first_name, 
                    u.last_name, 
                    s.name, 
                    b.name
            ),
            flat_data AS (
                SELECT
                    a.user_id,
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'flat_id', a.flat_id,
                            'flat_number', f.flat_number,
                            'floor_number', f.floor_number
                        )
                        ORDER BY f.flat_number
                    ) as flats
                FROM members a
                LEFT JOIN flats f ON f.id = a.flat_id
                ${whereClause}
                AND a.flat_id IS NOT NULL
                GROUP BY a.user_id
            ),
            housing_data AS (
                SELECT
                    a.user_id,
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'housing_id', a.housing_id,
                            'unit_number', hu.unit_number,
                            'unit_type', hu.unit_type,
                            'square_foot', hu.square_foot
                        )
                        ORDER BY hu.unit_number
                    ) as housing_units
                FROM members a
                LEFT JOIN housing_units hu ON hu.id = a.housing_id
                ${whereClause}
                AND a.housing_id IS NOT NULL
                GROUP BY a.user_id
            )
            SELECT
                ub.user_id,
                ub.move_in_date,
                ub.created_by,
                ub.created_at,
                ub.member_name,
                ub.society_name,
                ub.building_name,
                fd.flats,
                hd.housing_units
            FROM user_base ub
            LEFT JOIN flat_data fd ON fd.user_id = ub.user_id
            LEFT JOIN housing_data hd ON hd.user_id = ub.user_id
            ORDER BY ub.member_name
        `;

    const res: QueryResult<AssignedMemberResponse> =
      await query<AssignedMemberResponse>(queryText, values);

    return res.rows;
  } catch (error) {
    throw new Error(`Error getting assigned members: ${error}`);
  }
};

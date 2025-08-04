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
            SELECT
                a.id,
                a.move_in_date,
                a.created_by,
                a.created_at,
                CONCAT(u.first_name, ' ', u.last_name) AS member_name,
                s.name AS society_name,
                b.name AS building_name,
                f.flat_number,
                f.floor_number,
                hu.unit_number,
                hu.unit_type,
                hu.square_foot
            FROM members a
            LEFT JOIN housing_units hu ON hu.id = a.housing_id
            LEFT JOIN users u ON u.id = a.user_id
            LEFT JOIN societies s ON s.id = a.society_id
            LEFT JOIN buildings b ON b.id = a.building_id
            LEFT JOIN flats f ON f.id = a.flat_id
            ${whereClause}
        `;

    const res: QueryResult<AssignedMemberResponse> =
      await query<AssignedMemberResponse>(queryText, values);

    return res.rows;
  } catch (error) {
    throw new Error(`Error getting assigned members: ${error}`);
  }
};

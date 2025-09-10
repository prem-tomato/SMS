import { query } from "@/db/database-connect";
import { QueryResult } from "pg";
import { BuildingOptions, ListBuildingResponse } from "./buildings.types";

export const listBuildings = async (): Promise<ListBuildingResponse[]> => {
  try {
    const queryText = `
        SELECT
            b.name,
            b.total_floors,
            societies.name AS society_name,
            CONCAT(users.first_name, ' ', users.last_name) AS action_by
        FROM buildings b
        LEFT JOIN societies ON societies.id = b.society_id
        LEFT JOIN users ON users.id = b.created_by
    `;

    const res: QueryResult<ListBuildingResponse> =
      await query<ListBuildingResponse>(queryText);

    return res.rows;
  } catch (error) {
    throw new Error(`Error listing buildings: ${error}`);
  }
};

export const listBuildingOptionsBySocietyId = async (
  societyId: string
): Promise<BuildingOptions[]> => {
  try {
    const queryText: string = `
      SELECT id, name, total_floors FROM buildings
      WHERE society_id = $1 AND is_deleted = false
    `;

    const res: QueryResult<BuildingOptions> = await query<BuildingOptions>(
      queryText,
      [societyId]
    );

    return res.rows;
  } catch (error) {
    throw new Error(`Error getting buildings options: ${error}`);
  }
};

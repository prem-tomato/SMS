import { query } from "@/db/database-connect";
import { QueryResult } from "pg";
import {
  AddBuildingReqBodyAnother,
  BuildingOptions,
  ListBuildingResponse,
} from "./buildings.types";

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
        LEFT JOIN users ON users.id = societies.created_by
    `;

    const res: QueryResult<ListBuildingResponse> =
      await query<ListBuildingResponse>(queryText);

    return res.rows;
  } catch (error) {
    throw new Error(`Error listing buildings: ${error}`);
  }
};

export const addBuildingAnother = async (
  reqBody: AddBuildingReqBodyAnother,
  userId: string
): Promise<void> => {
  try {
    const queryText: string = `
        INSERT INTO buildings (society_id, name, total_floors, created_by)
        VALUES ($1, $2, $3, $4)
    `;

    await query(queryText, [
      reqBody.society_id,
      reqBody.name,
      reqBody.total_floors,
      userId,
    ]);
  } catch (error) {
    throw new Error(`Error adding building to society: ${error}`);
  }
};

export const listBuildingOptionsBySocietyId = async (
  societyId: string
): Promise<BuildingOptions[]> => {
  try {
    const queryText: string = `
      SELECT id, name FROM buildings
      WHERE society_id = $1
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

import { query } from "@/db/database-connect";
import { QueryResult } from "pg";
import { GetAllFlats } from "./flats.types";

export const listAllFlats = async (): Promise<GetAllFlats[]> => {
  try {
    const queryText: string = `
            SELECT
                flats.id,
                flats.flat_number,
                flats.floor_number,
                flats.is_occupied,
                societies.name as society_name,
                buildings.name as building_name,
                flats.square_foot,
                flats.pending_maintenance,
                flats.current_maintenance,
                societies.id as society_id,
                buildings.id as building_id
            FROM flats
            INNER JOIN societies ON flats.society_id = societies.id
            INNER JOIN buildings ON flats.building_id = buildings.id
        `;

    const result: QueryResult<GetAllFlats> = await query<GetAllFlats>(
      queryText
    );

    return result.rows;
  } catch (error) {
    throw new Error(`Failed to list all flats: ${error}`);
  }
};

export const listAllFlatsBySociety = async (
  societyId: string
): Promise<GetAllFlats[]> => {
  try {
    const queryText: string = `
            SELECT
                flats.id,
                flats.flat_number,
                flats.floor_number,
                flats.is_occupied,
                societies.name as society_name,
                buildings.name as building_name,
                flats.square_foot,
                flats.pending_maintenance,
                flats.current_maintenance,
                societies.id as society_id,
                buildings.id as building_id
            FROM flats
            INNER JOIN societies ON flats.society_id = societies.id
            INNER JOIN buildings ON flats.building_id = buildings.id
            WHERE societies.id = $1
        `;

    const result: QueryResult<GetAllFlats> = await query<GetAllFlats>(
      queryText,
      [societyId]
    );

    return result.rows;
  } catch (error) {
    throw new Error(`Failed to list all flats: ${error}`);
  }
};

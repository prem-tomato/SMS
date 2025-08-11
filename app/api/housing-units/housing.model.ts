import { query } from "@/db/database-connect";
import { QueryResult } from "pg";
import { HousingUnits } from "../socities/socities.types";
import housingLogger from "./housing.logger";

export const getHousingUnits = async (): Promise<HousingUnits[]> => {
  try {
    const queryText = `SELECT 
      hu.*,
      s.name as society_name
    FROM 
      housing_units hu
    LEFT JOIN 
      societies s ON hu.society_id = s.id
    `;

    const result: QueryResult<HousingUnits> = await query<HousingUnits>(
      queryText
    );

    return result.rows;
  } catch (error: any) {
    housingLogger.error("Error in getting all housing units:", error);

    throw error;
  }
};

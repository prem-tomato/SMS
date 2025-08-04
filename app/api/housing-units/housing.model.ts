import { query } from "@/db/database-connect";
import { QueryResult } from "pg";
import { HousingUnits } from "../socities/socities.types";
import housingLogger from "./housing.logger";

export const getHousingUnits = async (): Promise<HousingUnits[]> => {
  try {
    const queryText = "SELECT * FROM housing_units";

    const result: QueryResult<HousingUnits> = await query<HousingUnits>(
      queryText
    );

    return result.rows;
  } catch (error: any) {
    housingLogger.error("Error in getting all housing units:", error);

    throw error;
  }
};

import getMessage from "@/db/utils/messages";
import { generateResponseJSON, Response } from "@/db/utils/response-generator";
import { StatusCodes } from "http-status-codes";
import { HousingUnits } from "../socities/socities.types";
import housingLogger from "./housing.logger";
import { getHousingUnits } from "./housing.model";

export const getAllHousingUnits = async (): Promise<
  Response<HousingUnits[]>
> => {
  try {
    const housingUnits = await getHousingUnits();

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("LIST_SUCCESSFULL"),
      housingUnits
    );
  } catch (error: any) {
    housingLogger.error("Error in getting all housing units:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

import getMessage from "@/db/utils/messages";
import { generateResponseJSON, Response } from "@/db/utils/response-generator";
import { StatusCodes } from "http-status-codes";
import socitiesLogger from "../socities/socities.logger";

import {
  listBuildingOptionsBySocietyId,
  listBuildings,
} from "./buildings.model";
import { BuildingOptions, ListBuildingResponse } from "./buildings.types";

export const listBuildingsController = async (): Promise<
  Response<ListBuildingResponse[]>
> => {
  try {
    const buildings: ListBuildingResponse[] = await listBuildings();

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("LIST_SUCCESSFULL"),
      buildings
    );
  } catch (error: any) {
    socitiesLogger.error("Error in listBuildingsController:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

export const listBuildingOptionsBySocietyIdController = async (
  societyId: string
): Promise<Response<BuildingOptions[]>> => {
  try {
    const buildings: BuildingOptions[] = await listBuildingOptionsBySocietyId(
      societyId
    );

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("LIST_SUCCESSFULL"),
      buildings
    );
  } catch (error: any) {
    socitiesLogger.error(
      "Error in listBuildingOptionsBySocietyIdController:",
      error
    );

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

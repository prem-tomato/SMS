import getMessage from "@/db/utils/messages";
import { generateResponseJSON, Response } from "@/db/utils/response-generator";
import { StatusCodes } from "http-status-codes";
import socitiesLogger from "../../../socities.logger";
import { deleteBuildingModel, updateBuildingModel } from "./building.model";
import { UpdateBuildingReqBody } from "./building.types";

export const updateBuildingsController = async (
  request: Request,
  buildingId: string,
  id: string,
  reqBody: UpdateBuildingReqBody
): Promise<Response<void>> => {
  try {
    await updateBuildingModel(id, buildingId, reqBody);

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("BUILDING_UPDATED_SUCCESSFULLY")
    );
  } catch (error: any) {
    socitiesLogger.error("Error in updateBuildingsController:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

export const deleteBuildingsController = async (
  buildingId: string,
  id: string
): Promise<Response<void>> => {
  try {

    await deleteBuildingModel(id, buildingId);

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("BUILDING_DELETED_SUCCESSFULLY")
    );
  } catch (error: any) {
    socitiesLogger.error("Error in deleteBuildingsController:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

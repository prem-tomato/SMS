import {
  commitTransaction,
  rollbackTransaction,
  startTransaction,
  Transaction,
} from "@/db/configs/acid";
import getMessage from "@/db/utils/messages";
import { generateResponseJSON, Response } from "@/db/utils/response-generator";
import { StatusCodes } from "http-status-codes";
import socitiesLogger from "../../../socities.logger";
import {
  addFlatMaintenance,
  findBuildingById,
  findSocietyById,
} from "../../../socities.model";
import { Building, Societies } from "../../../socities.types";
import {
  deleteBuildingModel,
  deleteFlatMaintenance,
  updateBuildingModel,
  updateFlat,
} from "./building.model";
import { UpdateBuildingReqBody, UpdateFlatReqBody } from "./building.types";

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

export const updateFlatController = async (
  request: Request,
  reqBody: UpdateFlatReqBody,
  params: {
    id: string;
    buildingId: string;
    flatId: string;
  }
): Promise<Response<void>> => {
  const transaction: Transaction = await startTransaction();
  const { client } = transaction;

  try {
    const { pending_maintenance, ...restPayload } = reqBody;
    const userId: string = request.headers.get("userId")!;

    // Check society
    const society: Societies | undefined = await findSocietyById(params.id);
    if (!society) {
      await rollbackTransaction(transaction);
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("SOCIETY_NOT_FOUND")
      );
    }

    // Check building
    const building: Building | undefined = await findBuildingById(
      params.buildingId
    );
    if (!building) {
      await rollbackTransaction(transaction);
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("BUILDING_NOT_FOUND")
      );
    }

    // Floor validation
    if (reqBody.floor_number && reqBody.floor_number > building.total_floors) {
      await rollbackTransaction(transaction);
      return generateResponseJSON(
        StatusCodes.BAD_REQUEST,
        `Floor number ${reqBody.floor_number} is greater than total floors ${building.total_floors}`
      );
    }

    // Update flat details
    const flat = await updateFlat(
      restPayload,
      params.flatId,
      params.buildingId,
      params.id,
      userId,
      client
    );

    // ✅ Clear old maintenance before adding new ones
    await deleteFlatMaintenance(params.flatId, client);

    if (pending_maintenance?.length) {
      await addFlatMaintenance(
        pending_maintenance as { amount: number; reason: string }[],
        { id: params.id, buildingId: params.buildingId },
        flat.id,
        userId,
        client
      );
    }

    await commitTransaction(transaction);

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("FLAT_UPDATED_SUCCESSFULLY")
    );
  } catch (error: any) {
    socitiesLogger.error("Error in updateFlatController:", error);

    await rollbackTransaction(transaction);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

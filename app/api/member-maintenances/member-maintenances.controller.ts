import getMessage from "@/db/utils/messages";
import { generateResponseJSON, Response } from "@/db/utils/response-generator";
import { StatusCodes } from "http-status-codes";
import { findSocietyById } from "../socities/socities.model";
import { Societies } from "../socities/socities.types";
import memberMaintenanceLogger from "./member-maintenances.logger";
import { listMemberMaintenances } from "./member-maintenances.model";
import { GetMemberMaintenance } from "./member-maintenances.types";

export const getMemberMaintenancesController = async (
  request: Request,
  societyId: string,
  monthYear: string,
): Promise<Response<GetMemberMaintenance[]>> => {
  try {
    const society: Societies | undefined = await findSocietyById(societyId);
    if (!society) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("SOCIETY_NOT_FOUND")
      );
    }

    const memberMaintenance: GetMemberMaintenance[] =
      await listMemberMaintenances(societyId, monthYear);

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("LIST_SUCCESSFULL"),
      memberMaintenance
    );
  } catch (error: any) {
    memberMaintenanceLogger.error("Error in getMemberMonthlyDues:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

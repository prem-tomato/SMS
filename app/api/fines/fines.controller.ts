import getMessage from "@/db/utils/messages";
import { generateResponseJSON, Response } from "@/db/utils/response-generator";
import { StatusCodes } from "http-status-codes";
import finesLogger from "./fines.logger";
import { getFinesList } from "./fines.model";
import { Fines } from "./fines.types";

export const getFinesController = async (
  societyId: string
): Promise<Response<Fines[]>> => {
  try {
    const fines = await getFinesList(societyId);

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("LIST_SUCCESSFULL"),
      fines
    );
  } catch (error: any) {
    finesLogger.error("Error in getFinesController:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

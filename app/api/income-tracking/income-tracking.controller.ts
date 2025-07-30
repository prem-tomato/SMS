import getMessage from "@/db/utils/messages";
import { generateResponseJSON, Response } from "@/db/utils/response-generator";
import { StatusCodes } from "http-status-codes";
import { getIncomeTracking } from "../socities/socities.model";
import { IncomeTrackingResponse } from "../socities/socities.types";
import incomeLogger from "./income-tracking.logger";

export const getAllIncomeTrackingController = async (): Promise<
  Response<IncomeTrackingResponse[]>
> => {
  try {
    const incomeTrackings = await getIncomeTracking();

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("LIST_SUCCESSFULL"),
      incomeTrackings
    );
  } catch (error: any) {
    incomeLogger.error("Error in getIncomeTrackingController:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

import getMessage from "@/db/utils/messages";
import { generateResponseJSON, Response } from "@/db/utils/response-generator";
import { StatusCodes } from "http-status-codes";
import socitiesLogger from "../socities/socities.logger";
import { getExpenseTracking } from "../socities/socities.model";
import { ExpenseTrackingResponse } from "../socities/socities.types";

export const getAllExpenseTrackingController = async (): Promise<
  Response<ExpenseTrackingResponse[]>
> => {
  try {
    const expenseTrackings = await getExpenseTracking();

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("LIST_SUCCESSFULL"),
      expenseTrackings
    );
  } catch (error: any) {
    socitiesLogger.error("Error in getExpenseTrackingController:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

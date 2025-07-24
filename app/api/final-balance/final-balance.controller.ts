import getMessage from "@/db/utils/messages";
import { generateResponseJSON, Response } from "@/db/utils/response-generator";
import { StatusCodes } from "http-status-codes";
import finalBalanceLogger from "./final-balance.logger";
import { getFinalBalance } from "./final-balance.model";
import { FinalBalanceResponse } from "./final-balance.types";

export const getFinalBalanceController = async (
  societyId: string
): Promise<Response<FinalBalanceResponse>> => {
  try {
    const finalBalance = await getFinalBalance(societyId);

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("LIST_SUCCESSFULL"),
      finalBalance
    );
  } catch (error: any) {
    finalBalanceLogger.error("Error in getFinalBalanceController:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

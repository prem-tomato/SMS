import getMessage from "@/db/utils/messages";
import { generateResponseJSON, Response } from "@/db/utils/response-generator";
import { StatusCodes } from "http-status-codes";
import dues from "./due.logger";
import { getDues } from "./dues.model";

export const getDuesYearMonthController = async (): Promise<
  Response<{ month_year: string[] }>
> => {
  try {
    const dues = await getDues();

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("LIST_SUCCESSFULL"),
      dues
    );
  } catch (error: any) {
    dues.error("Error in getDuesYearMonthController:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

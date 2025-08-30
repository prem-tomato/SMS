import getMessage from "@/db/utils/messages";
import { generateResponseJSON, Response } from "@/db/utils/response-generator";
import { StatusCodes } from "http-status-codes";
import { NextRequest } from "next/server";
import finesLogger from "./fines.logger";
import { getFinesList, getHousingFinesList } from "./fines.model";
import { HousingFines } from "./fines.types";

export const getFinesController = async (
  request: NextRequest,
  societyId: string
): Promise<Response<any>> => {
  try {
    const societyType = request.headers.get("societyType");
    let res;

    if (societyType !== "housing") {
      console.log("getFinesList");
      res = await getFinesList(societyId);
    } else {
      console.log("getHousingFinesList");
      res = await getHousingFinesList(societyId);
    }

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("LIST_SUCCESSFULL"),
      res
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

export const getHousingFinesController = async (
  societyId: string
): Promise<Response<HousingFines[]>> => {
  try {
    const fines = await getHousingFinesList(societyId);

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("LIST_SUCCESSFULL"),
      fines
    );
  } catch (error: any) {
    finesLogger.error("Error in getHousingFinesController:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

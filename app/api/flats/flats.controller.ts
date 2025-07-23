import getMessage from "@/db/utils/messages";
import { generateResponseJSON, Response } from "@/db/utils/response-generator";
import { StatusCodes } from "http-status-codes";
import flatsLogger from "./flats.logger";
import { listAllFlats, listAllFlatsBySociety } from "./flats.model";
import { GetAllFlats } from "./flats.types";

export const getAllFlats = async (): Promise<Response<GetAllFlats[]>> => {
  try {
    const flats: GetAllFlats[] = await listAllFlats();

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("LIST_SUCCESSFULL"),
      flats
    );
  } catch (error: any) {
    flatsLogger.error("Error in getAllFlatsController:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

export const getAllFlatsBySociety = async (
  societyId: string
): Promise<Response<GetAllFlats[]>> => {
  try {
    const flats: GetAllFlats[] = await listAllFlatsBySociety(societyId);

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("LIST_SUCCESSFULL"),
      flats
    );
  } catch (error: any) {
    flatsLogger.error("Error in getAllFlatsBySociety:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

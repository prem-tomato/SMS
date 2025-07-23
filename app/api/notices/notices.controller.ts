import getMessage from "@/db/utils/messages";
import { generateResponseJSON, Response } from "@/db/utils/response-generator";
import { StatusCodes } from "http-status-codes";
import { getNotices } from "../socities/socities.model";
import { NoticeResponse } from "../socities/socities.types";

export const getAllNotices = async (): Promise<Response<NoticeResponse[]>> => {
  try {
    const notices: NoticeResponse[] = await getNotices();

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("LIST_SUCCESSFULL"),
      notices
    );
  } catch (error: any) {
    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

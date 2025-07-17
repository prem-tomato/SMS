import { SUPER_ADMIN } from "@/db/utils/enums/enum";
import getMessage from "@/db/utils/messages";
import { generateResponseJSON, Response } from "@/db/utils/response-generator";
import { StatusCodes } from "http-status-codes";
import {
  checkLoginKeyUnique,
  findSocietyById,
} from "../socities/socities.model";
import userLogger from "./user.logger";
import { AddUserReqBody } from "./user.types";

export const addUserController = async (
  request: Request,
  reqBody: AddUserReqBody
): Promise<Response<void>> => {
  try {
    const userId: string = request.headers.get("userId")!;

    const loginKeyUnique: string | undefined = await checkLoginKeyUnique(
      reqBody.login_key
    );
    if (loginKeyUnique) {
      return generateResponseJSON(
        StatusCodes.BAD_REQUEST,
        getMessage("LOGIN_KEY_ALREADY_EXISTS")
      );
    }

    // Check if the society exists
    const society: any | undefined = await findSocietyById(reqBody.society_id);
    if (!society) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("SOCIETY_NOT_FOUND")
      );
    }

    if (reqBody.role === SUPER_ADMIN) {
      if (society.created_by !== userId) {
        return generateResponseJSON(
          StatusCodes.UNAUTHORIZED,
          getMessage("SUPER_ADMIN_ROLE_NOT_ALLOWED")
        );
      }
    }

    return generateResponseJSON(
      StatusCodes.CREATED,
      getMessage("USER_CREATED_SUCCESSFULLY")
    );
  } catch (error: any) {
    userLogger.error("Error in addUserController:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

import { HOUSING } from "@/db/utils/enums/enum";
import getMessage from "@/db/utils/messages";
import { generateResponseJSON, Response } from "@/db/utils/response-generator";
import { StatusCodes } from "http-status-codes";
import userLogger from "./user.logger";
import {
  getUsers,
  getVacantUsers,
  getVacantUsersForHousing,
  listAllUsers,
} from "./user.model";
import { UserResponse } from "./user.types";

export const getUserController = async (
  sociteyId: string
): Promise<Response<UserResponse[]>> => {
  try {
    const user: UserResponse[] = await getUsers(sociteyId);

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("LIST_SUCCESSFULL"),
      user
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

export const getAllUsers = async (): Promise<Response<UserResponse[]>> => {
  try {
    const user: UserResponse[] = await listAllUsers();

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("LIST_SUCCESSFULL"),
      user
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

export const getVacantUserController = async (
  request: Request,
  sociteyId: string
): Promise<Response<UserResponse[]>> => {
  try {
    const societyType: string = request.headers.get("societyType")!;

    let user: UserResponse[];

    if (societyType === HOUSING) {
      user = await getVacantUsersForHousing(sociteyId);
    } else {
      user = await getVacantUsers(sociteyId);
    }

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("LIST_SUCCESSFULL"),
      user
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

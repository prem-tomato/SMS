import {
  commitTransaction,
  rollbackTransaction,
  startTransaction,
  Transaction,
} from "@/db/configs/acid";
import getMessage from "@/db/utils/messages";
import { generateResponseJSON, Response } from "@/db/utils/response-generator";
import authorizeServices from "@/services/auth.services";
import config from "@/services/config";
import { StatusCodes } from "http-status-codes";
import authLogger from "./auth.logger";
import { addToken, findUserByLoginKey } from "./auth.model";
import { LoginBody, LoginResponse, User } from "./auth.types";

const JWT_SECRET: string = config.JWT_SECRET!;
const JWT_ACCESS_TOKEN_LIFE_TIME: string = config.JWT_ACCESS_TOKEN_LIFE_TIME!;
const JWT_REFRESH_TOKEN_LIFE_TIME: string = config.JWT_REFRESH_TOKEN_LIFE_TIME!;

export const loginController = async (
  reqBody: LoginBody
): Promise<Response<LoginResponse>> => {
  console.log("Login controller called with body:", reqBody);
  const transaction: Transaction = await startTransaction();
  const { client } = transaction;
  try {
    const user: User | undefined = await findUserByLoginKey(reqBody.login_key);
    if (!user) {
      await rollbackTransaction(transaction);
      return generateResponseJSON(
        StatusCodes.UNAUTHORIZED,
        getMessage("LOGIN_KEY_NOT_FOUND")
      );
    }

    const tokenPayload = {
      login_key: reqBody.login_key,
      userId: user.id,
    };

    // Generate JWT token
    const accessToken: string = authorizeServices.createToken(
      tokenPayload,
      JWT_SECRET,
      JWT_ACCESS_TOKEN_LIFE_TIME
    );

    const refreshToken: string = authorizeServices.createToken(
      tokenPayload,
      JWT_SECRET,
      JWT_REFRESH_TOKEN_LIFE_TIME
    );

    // Store the token
    await addToken(client, refreshToken, user.id);

    await commitTransaction(transaction);

    return generateResponseJSON(StatusCodes.OK, getMessage("LOGIN_SUCCESS"), {
      access_token: accessToken,
      user: {
        id: user.id,
        role: user.role,
        socitey_id: user.socitey_id,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
      },
    });
  } catch (error: any) {
    // Log the error and return an internal server error response
    authLogger.error(`Error from login controller => ${error}`);

    await rollbackTransaction(transaction);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

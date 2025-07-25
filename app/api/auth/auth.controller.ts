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
import { parseUserAgent } from "@/utils/parseUserAgent";
import dayjs from "dayjs";
import { StatusCodes } from "http-status-codes";
import { findSocietyById } from "../socities/socities.model";
import { Societies } from "../socities/socities.types";
import authLogger from "./auth.logger";
import {
  addToken,
  findUserById,
  findUserByLoginKey,
  removeOtherTokens,
} from "./auth.model";
import { LoginBody, LoginResponse, User, UserAgentData } from "./auth.types";

const JWT_SECRET: string = config.JWT_SECRET!;
const JWT_ACCESS_TOKEN_LIFE_TIME: string = config.JWT_ACCESS_TOKEN_LIFE_TIME!;
const JWT_REFRESH_TOKEN_LIFE_TIME: string = config.JWT_REFRESH_TOKEN_LIFE_TIME!;

export const loginController = async (
  request: Request,
  reqBody: LoginBody
): Promise<Response<LoginResponse>> => {
  const transaction: Transaction = await startTransaction();
  const { client } = transaction;
  try {
    const clientIp: string = request.headers
      .get("x-forwarded-for")!
      ?.split(",")[0]
      .trim();

    const userAgent = request.headers.get("user-agent") || "";

    const user: User | undefined = await findUserByLoginKey(reqBody.login_key);
    if (!user) {
      await rollbackTransaction(transaction);
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("LOGIN_KEY_NOT_FOUND")
      );
    }

    const society: Societies | undefined = await findSocietyById(
      user.society_id
    );
    if (
      society?.end_date &&
      dayjs(society.end_date).endOf("day").isBefore(dayjs())
    ) {
      await rollbackTransaction(transaction);
      return generateResponseJSON(
        StatusCodes.FORBIDDEN,
        getMessage("SOCIETY_SUBSCRIPTION_ENDED")
      );
    }

    const tokenPayload = {
      login_key: reqBody.login_key,
      userId: user.id,
      role: user.role,
      societyId: user?.society_id,
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

    await removeOtherTokens(client, user.id);

    const { browser, os, device } = parseUserAgent(userAgent);

    const userAgentData: UserAgentData = {
      browser,
      os,
      device,
      clientIp,
    };

    // Store the token
    await addToken(client, refreshToken, user.id, userAgentData);

    await commitTransaction(transaction);

    return generateResponseJSON(StatusCodes.OK, getMessage("LOGIN_SUCCESS"), {
      access_token: accessToken,
      role: user.role,
      societyId: user.society_id,
      user: {
        id: user.id,
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

export const getMeController = async (
  request: Request
): Promise<Response<User>> => {
  try {
    const userId: string = request.headers.get("userId")!;

    const user: User | undefined = await findUserById(userId);
    if (!user) {
      return generateResponseJSON(
        StatusCodes.UNAUTHORIZED,
        getMessage("USER_NOT_FOUND")
      );
    }

    return generateResponseJSON(StatusCodes.OK, getMessage("USER_FOUND"), user);
  } catch (error: any) {
    authLogger.error(`Error from login controller => ${error}`);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

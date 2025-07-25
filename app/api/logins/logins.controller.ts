import getMessage from "@/db/utils/messages";
import { generateResponseJSON, Response } from "@/db/utils/response-generator";
import { StatusCodes } from "http-status-codes";
import loginsLogger from "./logins.logger";
import { getLoginsList } from "./logins.model";

export type LoginsResponse = {
  id: string;
  user_name: string;
  login_time: string;
  login_ip: string;
  browser: string;
  os: string;
  device: string;
};

export const getLoginsController = async (
  request: Request
): Promise<Response<LoginsResponse[]>> => {
  try {
    const role = request.headers.get("role")!;

    if (role !== "super_admin") {
      return generateResponseJSON(
        StatusCodes.FORBIDDEN,
        getMessage("NOT_ALLOWED_TO_VIEW_LOGINS")
      );
    }

    const logins = await getLoginsList();

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("LIST_SUCCESSFULL"),
      logins
    );
  } catch (error: any) {
    loginsLogger.error("Error in getLoginsController:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

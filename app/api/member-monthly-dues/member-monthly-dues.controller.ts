import getMessage from "@/db/utils/messages";
import { generateResponseJSON, Response } from "@/db/utils/response-generator";
import { StatusCodes } from "http-status-codes";
import memberMonthlyDuesLogger from "./member-monthly-dues.logger";
import { listMemberMonthlyDues } from "./member-monthly-dues.model";
import { GetMemberMonthlyDuesResponse } from "./member-monthly-dues.types";

export const getMemberMonthlyDuesController = async (
  request: Request,
  monthYear: string,
  societyId?: string
): Promise<Response<GetMemberMonthlyDuesResponse[]>> => {
  try {
    const role = request.headers.get("role")!;

    if (role === "member") {
      return generateResponseJSON(
        StatusCodes.FORBIDDEN,
        getMessage("NOT_ALLOWED_TO_VIEW_LOGINS")
      );
    }

    const memberMonthlyDues = await listMemberMonthlyDues(monthYear, societyId);

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("LIST_SUCCESSFULL"),
      memberMonthlyDues
    );
  } catch (error: any) {
    memberMonthlyDuesLogger.error(
      "Error in getMemberMonthlyDuesController:",
      error
    );

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};


import { StatusCodes } from "http-status-codes";
import { generateResponseJSON, Response } from "@/db/utils/response-generator";
import getMessage from "@/db/utils/messages";
import { getAdminDashboard } from "./admin-dashboard.model";


export const getAdminDashboardController = async (): Promise<Response<any>> => {
  try {
    const adminDashboard = await getAdminDashboard();

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("ADMIN_DASHBOARD_LISTED_SUCCESSFULLY"),
      adminDashboard
    );
  } catch (error: any) {
    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
}
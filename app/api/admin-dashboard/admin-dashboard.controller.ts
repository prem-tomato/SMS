import getMessage from "@/db/utils/messages";
import { generateResponseJSON, Response } from "@/db/utils/response-generator";
import { StatusCodes } from "http-status-codes";
import {
  getAdminDashboard,
  getSocietyIdByMemberId,
} from "./admin-dashboard.model";

export const getAdminDashboardController = async (
  request: Request
): Promise<Response<any>> => {
  try {
    const userId: string = request.headers.get("userId")!;

    const userRole: string = request.headers.get("role")!;

    let dashboardData;

    if (userRole === "super_admin") {
      dashboardData = await getAdminDashboard(); // all societies
    } else if (userRole === "admin" || userRole === "member") {
      const societyId = await getSocietyIdByMemberId(userId);
      dashboardData = await getAdminDashboard(societyId); // scoped to one society
    } else {
      throw new Error("Unauthorized role");
    }

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("ADMIN_DASHBOARD_LISTED_SUCCESSFULLY"),
      dashboardData
    );
  } catch (error: any) {
    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

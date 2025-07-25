import { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { NextRequest, NextResponse } from "next/server";
import { getAdminDashboardController } from "../admin-dashboard.controller";
import adminDashboardLogger from "../admin-dashboard.logger";

export const GET = async (
  request: NextRequest,
  { params }: { params: { societyId: string } }
): Promise<NextResponse> => {
  adminDashboardLogger.info("GET /api/admin-dashboard/:societyId");
  adminDashboardLogger.debug("getting admin dashboard");

  const authResult = await authMiddleware(request);

  if (authResult instanceof NextResponse) return authResult;

  const { status, ...responseData }: Response<any> =
    await getAdminDashboardController(request, params.societyId);

  return NextResponse.json(responseData, { status });
};

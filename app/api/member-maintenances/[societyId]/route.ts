import { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import validationMiddleware from "@/middlewares/validation-middleware";
import { NextRequest, NextResponse } from "next/server";
import { getMemberMaintenancesController } from "../member-maintenances.controller";
import memberMaintenanceLogger from "../member-maintenances.logger";
import { GetMemberMaintenance } from "../member-maintenances.types";
import { memberMaintenanceValidationSchema } from "../member-maintenances.validation";

export const GET = async (
  request: NextRequest,
  { params }: { params: { societyId: string } }
): Promise<NextResponse> => {
  memberMaintenanceLogger.debug("GET /api/member-maintenances/[societyId]");
  memberMaintenanceLogger.info(
    `getting member-maintenances for societyId ${params.societyId}`
  );

  const { response } = await validationMiddleware<GetMemberMaintenance>(
    request,
    memberMaintenanceValidationSchema,
    params
  );

  // If validation fails, return the error response
  if (response) return response;

  const authResult = await authMiddleware(request);

  if (authResult instanceof NextResponse) return authResult;

  const monthYear = request.nextUrl.searchParams.get("monthYear")!;

  const { status, ...responseData }: Response<GetMemberMaintenance[]> =
    await getMemberMaintenancesController(request, params.societyId, monthYear);

  return NextResponse.json(responseData, { status });
};

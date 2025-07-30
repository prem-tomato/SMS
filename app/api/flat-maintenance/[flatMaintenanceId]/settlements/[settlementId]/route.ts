import type { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import validationMiddleware from "@/middlewares/validation-middleware";
import { NextRequest, NextResponse } from "next/server";
import { updateSettlementController } from "../../../flat-maintenance.controller";
import flatMaintenanceLogger from "../../../flat-maintenance.logger";
import { updateSettlementValidation } from "../../../flat-maintenance.validation";

export const PATCH = async (
  request: NextRequest,
  { params }: { params: { flatMaintenanceId: string; settlementId: string } }
): Promise<NextResponse> => {
  flatMaintenanceLogger.info(
    "PATCH api/flat-maintenance/[flatMaintenanceId]/settlements/[settlementId]"
  );
  flatMaintenanceLogger.debug(
    `updating settlement ${params.settlementId} for flat maintenance ${params.flatMaintenanceId}`
  );

  const { response } = await validationMiddleware(
    request,
    updateSettlementValidation,
    params
  );

  // If validation fails, return the error response
  if (response) return response;

  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  // Step 4: If validation, authentication, and permission check succeed, process the request
  const { status, ...responseData }: Response<void> =
    await updateSettlementController(
      request,
      params.flatMaintenanceId,
      params.settlementId
    );

  // Return the response with the appropriate status code
  return NextResponse.json(responseData, { status });
};

import type { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import validationMiddleware from "@/middlewares/validation-middleware";
import { NextRequest, NextResponse } from "next/server";
import { manageFlatMaintenanceController } from "../flat-maintenance.controller";
import flatMaintenanceLogger from "../flat-maintenance.logger";
import { ManageFLatMaintenance } from "../flat-maintenance.types";
import { manageFlatMaintenanceValidation } from "../flat-maintenance.validation";

export const PATCH = async (
  request: NextRequest,
  { params }: { params: { flatMaintenanceId: string } }
): Promise<NextResponse> => {
  flatMaintenanceLogger.info("PATCH api/flat-maintenance/[flatMaintenanceId]");
  flatMaintenanceLogger.debug(
    `updating flat maintenance ${params.flatMaintenanceId}`
  );

  const { reqBody, response } =
    await validationMiddleware<ManageFLatMaintenance>(
      request,
      manageFlatMaintenanceValidation,
      params
    );

  // If validation fails, return the error response
  if (response) return response;

  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  // Step 4: If validation, authentication, and permission check succeed, process the request
  const { status, ...responseData }: Response<void> =
    await manageFlatMaintenanceController(
      request,
      reqBody,
      params.flatMaintenanceId
    );

  // Return the response with the appropriate status code
  return NextResponse.json(responseData, { status });
};

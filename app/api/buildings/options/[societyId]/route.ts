import type { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import validationMiddleware from "@/middlewares/validation-middleware";
import { NextRequest, NextResponse } from "next/server";
import { listBuildingOptionsBySocietyIdController } from "../../buildings.controller";
import buildingLogger from "../../buildings.logger";
import { BuildingOptions } from "../../buildings.types";
import { getBuildingOptionsValidation } from "../../buildings.validation";

export const GET = async (
  request: NextRequest,
  { params }: { params: { societyId: string } }
): Promise<NextResponse> => {
  buildingLogger.info("GET api/socities/[id]/building");
  buildingLogger.debug(`getting all buildings from society`);

  const { response } = await validationMiddleware(
    request,
    getBuildingOptionsValidation,
    params
  );

  // If validation fails, return the error response
  if (response) return response;

  // Step 1: Verify the JWT token for authentication
  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  // Step 3: If validation, authentication, and permission check succeed, process the request
  const { status, ...responseData }: Response<BuildingOptions[]> =
    await listBuildingOptionsBySocietyIdController(params.societyId);

  // Return the response with the appropriate status code
  return NextResponse.json(responseData, { status });
};

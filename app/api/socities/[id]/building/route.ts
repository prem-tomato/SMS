import type { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import validationMiddleware from "@/middlewares/validation-middleware";
import { NextRequest, NextResponse } from "next/server";
import { addBuildingController } from "../../socities.controller";
import socitiesLogger from "../../socities.logger";
import { AddBuildingReqBody, BuildingResponse } from "../../socities.types";
import { addBuildingValidation } from "../../socities.validation";

export const POST = async (
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> => {
  socitiesLogger.info("POST api/socities/[id]/building");
  socitiesLogger.debug(`adding building to society ${params.id}`);

  const { reqBody, response } = await validationMiddleware<AddBuildingReqBody>(
    request,
    addBuildingValidation,
    params
  );

  // If validation fails, return the error response
  if (response) return response;

  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  // Step 2: If validation and authentication succeed, process the request
  const { status, ...responseData }: Response<BuildingResponse> =
    await addBuildingController(request, reqBody, params.id);

  // Return the response with the appropriate status code
  return NextResponse.json(responseData, { status });
};

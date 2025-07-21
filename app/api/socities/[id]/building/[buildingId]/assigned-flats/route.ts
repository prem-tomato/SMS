import { getAssignedFlatUserController } from "@/app/api/socities/socities.controller";
import socitiesLogger from "@/app/api/socities/socities.logger";
import { AssignedFlatOptions } from "@/app/api/socities/socities.types";
import { flatResponseValidation } from "@/app/api/socities/socities.validation";
import type { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import validationMiddleware from "@/middlewares/validation-middleware";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  request: NextRequest,
  { params }: { params: { id: string; buildingId: string } }
): Promise<NextResponse> => {
  socitiesLogger.info(
    "GET api/socities/[id]/building/[buildingId]/assigned-flats"
  );
  socitiesLogger.debug(
    `getting assigned flats from building ${params.buildingId}, society ${params.id}`
  );

  const { response } = await validationMiddleware(
    request,
    flatResponseValidation,
    params
  );

  // If validation fails, return the error response
  if (response) return response;

  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  // Step 3: If validation, authentication, and permission check succeed, process the request
  const { status, ...responseData }: Response<AssignedFlatOptions[]> =
    await getAssignedFlatUserController(params);

  // Return the response with the appropriate status code
  return NextResponse.json(responseData, { status });
};

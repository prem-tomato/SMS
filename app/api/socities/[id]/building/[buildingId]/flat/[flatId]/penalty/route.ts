import { addFlatPenaltyController } from "@/app/api/socities/socities.controller";
import socitiesLogger from "@/app/api/socities/socities.logger";
import { AddflatPenaltyReqBody } from "@/app/api/socities/socities.types";
import { flatPenaltyValidation } from "@/app/api/socities/socities.validation";
import type { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import validationMiddleware from "@/middlewares/validation-middleware";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (
  request: NextRequest,
  { params }: { params: { id: string; buildingId: string; flatId: string } }
): Promise<NextResponse> => {
  socitiesLogger.info(
    "POST api/socities/[id]/building/[buildingId]/flat/[flatId]"
  );
  socitiesLogger.debug(
    `updating flats penalties in building ${params.buildingId}, society ${params.id} and flat ${params.flatId}`
  );

  const { reqBody, response } =
    await validationMiddleware<AddflatPenaltyReqBody>(
      request,
      flatPenaltyValidation,
      params
    );

  // If validation fails, return the error response
  if (response) return response;

  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  // Step 4: If validation, authentication, and permission check succeed, process the request
  const { status, ...responseData }: Response<void> =
    await addFlatPenaltyController(request, reqBody, params);

  // Return the response with the appropriate status code
  return NextResponse.json(responseData, { status });
};

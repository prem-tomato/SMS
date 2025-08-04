import type { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import validationMiddleware from "@/middlewares/validation-middleware";
import { NextRequest, NextResponse } from "next/server";
import { assignHousingUnitController } from "../../../../socities.controller";
import socitiesLogger from "../../../../socities.logger";
import { AssignHousingUnitReqBody } from "../../../../socities.types";
import { assignHousingUnit } from "../../../../socities.validation";

export const POST = async (
  request: NextRequest,
  { params }: { params: { id: string; housingId: string } }
) => {
  socitiesLogger.info("POST api/socities/[id]/housing/[housingId]/assign-unit");
  socitiesLogger.debug(`assign members to flat ${params.housingId}`);

  const { reqBody, response } =
    await validationMiddleware<AssignHousingUnitReqBody>(
      request,
      assignHousingUnit,
      params
    );

  // If validation fails, return the error response
  if (response) return response;

  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  const { status, ...responseData }: Response<void> =
    await assignHousingUnitController(request, reqBody, params);

  // Return the response with the appropriate status code
  return NextResponse.json(responseData, { status });
};

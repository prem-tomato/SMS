import { addHousingUnitPenaltyController } from "@/app/api/socities/socities.controller";
import socitiesLogger from "@/app/api/socities/socities.logger";
import { AddHousingUnitPenaltyReqBody } from "@/app/api/socities/socities.types";
import { addHousingUnitPenaltyValidation } from "@/app/api/socities/socities.validation";
import type { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import validationMiddleware from "@/middlewares/validation-middleware";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (
  request: NextRequest,
  { params }: { params: { id: string; housingId: string } }
): Promise<NextResponse> => {
  socitiesLogger.info("POST /api/socities/:id/housing/:housingId/penalty");
  socitiesLogger.debug("Creating a new penalty...");

  // Step 1: Validate the request data
  const { reqBody, response } =
    await validationMiddleware<AddHousingUnitPenaltyReqBody>(
      request,
      addHousingUnitPenaltyValidation,
      params
    );

  // If validation fails, return the error response
  if (response) return response;

  // Step 2: Verify the JWT token for authentication
  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  // Step 4: If validation, authentication, and permission check succeed, process the request
  const { status, ...responseData }: Response<void> =
    await addHousingUnitPenaltyController(
      request,
      params.id,
      params.housingId,
      reqBody
    );

  // Return the response with the appropriate status code
  return NextResponse.json(responseData, { status });
};

import type { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import validationMiddleware from "@/middlewares/validation-middleware";
import { NextRequest, NextResponse } from "next/server";
import { updateEndDateController } from "../../socities.controller";
import socitiesLogger from "../../socities.logger";
import { AddEndDateReqBody } from "../../socities.types";
import { addEndDateValidation } from "../../socities.validation";

export const PATCH = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  socitiesLogger.info("POST /api/socities/[id]/end-date");
  socitiesLogger.debug("Updating end date...");

  // Step 1: Validate the request data
  const { reqBody, response } = await validationMiddleware<AddEndDateReqBody>(
    request,
    addEndDateValidation,
    params
  );

  console.log(reqBody);

  // If validation fails, return the error response
  if (response) return response;

  // Step 2: Verify the JWT token for authentication
  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  // Step 4: If validation, authentication, and permission check succeed, process the request
  const { status, ...responseData }: Response<void> =
    await updateEndDateController(request, reqBody, params.id);

  // Return the response with the appropriate status code
  return NextResponse.json(responseData, { status });
};

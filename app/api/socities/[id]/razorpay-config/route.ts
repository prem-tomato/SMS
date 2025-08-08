import type { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import validationMiddleware from "@/middlewares/validation-middleware";
import { NextRequest, NextResponse } from "next/server";
import { addRazorPayConfigController } from "../../socities.controller";
import socitiesLogger from "../../socities.logger";
import { AddRazorPayConfig } from "../../socities.types";
import { addRazorPayConfigValidation } from "../../socities.validation";

export const POST = async (
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> => {
  socitiesLogger.info("POST /api/socities/[id]/razorpay-config");
  socitiesLogger.debug("Creating a new society...");

  // Step 1: Validate the request data
  const { reqBody, response } = await validationMiddleware<AddRazorPayConfig>(
    request,
    addRazorPayConfigValidation,
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
    await addRazorPayConfigController(request, params.id, reqBody);

  // Return the response with the appropriate status code
  return NextResponse.json(responseData, { status });
};

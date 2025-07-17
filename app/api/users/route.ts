import type { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import validationMiddleware from "@/middlewares/validation-middleware";
import { NextRequest, NextResponse } from "next/server";
import { addUserController } from "./user.controller";
import userLogger from "./user.logger";
import { AddUserReqBody } from "./user.types";
import { addUserValidation } from "./user.validation";

export const POST = async (request: NextRequest) => {
  userLogger.info("POST /api/users");
  userLogger.debug("Adding user");

  const { reqBody, response } = await validationMiddleware<AddUserReqBody>(
    request,
    addUserValidation
  );

  // If validation fails, return the error response
  if (response) return response;

  // Step 1: Verify the JWT token for authentication
  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  // Step 2: If validation and authentication succeed, process the request
  const { status, ...responseData }: Response<void> = await addUserController(
    request,
    reqBody
  );

  // Return the response with the appropriate status code
  return NextResponse.json(responseData, { status });
};

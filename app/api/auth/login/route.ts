import { Response } from "@/db/utils/response-generator";
import validationMiddleware from "@/middlewares/validation-middleware";
import { NextRequest, NextResponse } from "next/server";
import { loginController } from "../auth.controller";
import authLogger from "../auth.logger";
import { LoginBody, LoginResponse } from "../auth.types";
import { loginValidation } from "../auth.validation";

export const POST = async (request: NextRequest): Promise<NextResponse> => {
  authLogger.debug("POST api/auth/login");
  authLogger.info("logging in...");

  const { reqBody, response } = await validationMiddleware<LoginBody>(
    request,
    loginValidation
  );

  // If validation fails, return the error response
  if (response) return response;

  // Call the login controller with the validated request body
  const { status, ...responseData }: Response<LoginResponse> =
    await loginController(request, reqBody);

  // Return the response from the login controller with the appropriate status code
  return NextResponse.json(responseData, { status });
};

import type { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { NextRequest, NextResponse } from "next/server";
import { getAllUsers } from "./user.controller";
import userLogger from "./user.logger";
import { UserResponse } from "./user.types";

export const GET = async (request: NextRequest): Promise<NextResponse> => {
  userLogger.debug("GET api/users");
  userLogger.info("listing users...");

  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  // Call the add flat controller with the validated request body
  const { status, ...responseData }: Response<UserResponse[]> =
    await getAllUsers();

  // Return the response from the add flat controller with the appropriate status code
  return NextResponse.json(responseData, { status });
};

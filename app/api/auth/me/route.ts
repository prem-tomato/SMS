import type { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { NextRequest, NextResponse } from "next/server";
import { getMeController } from "../auth.controller";
import authLogger from "../auth.logger";
import { User } from "../auth.types";

export const GET = async (req: NextRequest): Promise<NextResponse> => {
  authLogger.info("GET /api/auth/me");
  authLogger.debug("getting user from session");

  const authResult = await authMiddleware(req);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  const { status, ...responseData }: Response<User> = await getMeController(
    req
  );

  // Return the response with the appropriate status code
  return NextResponse.json(responseData, { status });
};

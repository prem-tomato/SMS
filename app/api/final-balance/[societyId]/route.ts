import type { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { NextRequest, NextResponse } from "next/server";
import { getFinalBalanceController } from "../final-balance.controller";
import finalBalanceLogger from "../final-balance.logger";
import { FinalBalanceResponse } from "../final-balance.types";

export const GET = async (
  request: NextRequest,
  { params }: { params: { societyId: string } }
) => {
  finalBalanceLogger.info("GET /api/final-balance");
  finalBalanceLogger.debug("getting final balance");

  // Authenticate the request
  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  const { status, ...responseData }: Response<FinalBalanceResponse> =
    await getFinalBalanceController(params.societyId);

  // Return the response with the appropriate status code
  return NextResponse.json(responseData, { status });
};

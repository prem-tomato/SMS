import { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { NextRequest, NextResponse } from "next/server";
import { LoginsResponse, getLoginsController } from "../logins.controller";
import loginsLogger from "../logins.logger";

export const GET = async (
  request: NextRequest,
  { params }: { params: { societyId: string } }
): Promise<NextResponse> => {
  loginsLogger.info("GET /api/logins/[societyId]");
  loginsLogger.debug("getting logins");

  const authResult = await authMiddleware(request);

  if (authResult instanceof NextResponse) return authResult;

  const { status, ...responseData }: Response<LoginsResponse[]> =
    await getLoginsController(request, params.societyId);

  return NextResponse.json(responseData, { status });
};

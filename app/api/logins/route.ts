import { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { NextRequest, NextResponse } from "next/server";
import { getLoginsController, LoginsResponse } from "./logins.controller";
import loginsLogger from "./logins.logger";

export const GET = async (request: NextRequest): Promise<NextResponse> => {
  loginsLogger.info("GET /api/logins");
  loginsLogger.debug("getting logins");

  const authResult = await authMiddleware(request);

  if (authResult instanceof NextResponse) return authResult;

  const { status, ...responseData }: Response<LoginsResponse[]> =
    await getLoginsController(request);

  return NextResponse.json(responseData, { status });
};

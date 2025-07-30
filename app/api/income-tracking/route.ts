import type { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { NextRequest, NextResponse } from "next/server";
import { IncomeTrackingResponse } from "../socities/socities.types";
import { getAllIncomeTrackingController } from "./income-tracking.controller";
import incomeLogger from "./income-tracking.logger";

export const GET = async (request: NextRequest): Promise<NextResponse> => {
  incomeLogger.info("GET api/income-tracking");
  incomeLogger.debug(`getting income tracking`);

  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  const { status, ...responseData }: Response<IncomeTrackingResponse[]> =
    await getAllIncomeTrackingController();

  // Return the response with the appropriate status code
  return NextResponse.json(responseData, { status });
};

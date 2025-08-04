import type { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { NextRequest, NextResponse } from "next/server";
import dues from "./due.logger";
import { getDuesYearMonthController } from "./dues.controller";

export const GET = async (
  request: NextRequest,
  { params }: { params: { societyId: string } }
) => {
  dues.info("GET /api/dues-year-month");
  dues.debug("getting dues year month");

  // Authenticate the request
  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  const { status, ...responseData }: Response<{ month_year: string[] }> =
    await getDuesYearMonthController();

  // Return the response with the appropriate status code
  return NextResponse.json(responseData, { status });
};

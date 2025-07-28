import { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { NextRequest, NextResponse } from "next/server";
import { getMemberMonthlyDuesController } from "./member-monthly-dues.controller";
import memberMonthlyDuesLogger from "./member-monthly-dues.logger";
import { GetMemberMonthlyDuesResponse } from "./member-monthly-dues.types";

export const GET = async (request: NextRequest): Promise<NextResponse> => {
  memberMonthlyDuesLogger.debug("GET /api/member-monthly-dues");
  memberMonthlyDuesLogger.info("getting member-monthly-dues");

  const authResult = await authMiddleware(request);
  
  if (authResult instanceof NextResponse) return authResult;

  const monthYear = request.nextUrl.searchParams.get("monthYear")!;
  
  const { status, ...responseData }: Response<GetMemberMonthlyDuesResponse[]> =
    await getMemberMonthlyDuesController(request, monthYear);

  return NextResponse.json(responseData, { status });
};

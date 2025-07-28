import type { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { NextRequest, NextResponse } from "next/server";
import { getMemberMonthlyDues } from "../../member-monthly-dues.controller";
import memberMonthlyDuesLogger from "../../member-monthly-dues.logger";
import { GetMemberMonthlyDuesResponse } from "../../member-monthly-dues.types";

export const GET = async (
  request: NextRequest,
  { params }: { params: { recordId: string } }
): Promise<NextResponse> => {
  memberMonthlyDuesLogger.info("GET api/member-monthly-dues/view/[recordId]");
  memberMonthlyDuesLogger.debug(
    `GET monthly dues for record ${params.recordId}`
  );

  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  const { status, ...responseData }: Response<GetMemberMonthlyDuesResponse> =
    await getMemberMonthlyDues(params.recordId);

  // Return the response with the appropriate status code
  return NextResponse.json(responseData, { status });
};

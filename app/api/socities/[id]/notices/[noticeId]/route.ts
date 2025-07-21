import { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import validationMiddleware from "@/middlewares/validation-middleware";
import { NextRequest, NextResponse } from "next/server";
import { toggleNoticeStatusController } from "../../../socities.controller";
import socitiesLogger from "../../../socities.logger";
import { toggleNoticeStatusValidation } from "../../../socities.validation";

export const POST = async (
  request: NextRequest,
  { params }: { params: { id: string; noticeId: string } }
): Promise<NextResponse> => {
  socitiesLogger.info(`POST /api/socities/${params.id}/notices`);
  socitiesLogger.debug("creating a new notice");

  const { reqBody, response } = await validationMiddleware(
    request,
    toggleNoticeStatusValidation,
    params
  );

  if (response) return response;

  const authResult = await authMiddleware(request);

  if (authResult instanceof NextResponse) return authResult;

  const { status, ...responseData }: Response<void> =
    await toggleNoticeStatusController(params.id, params.noticeId);

  return NextResponse.json(responseData, { status });
};

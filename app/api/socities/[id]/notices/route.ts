import { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import validationMiddleware from "@/middlewares/validation-middleware";
import { NextRequest, NextResponse } from "next/server";
import {
  createNoticeController,
  getNoticesController,
} from "../../socities.controller";
import socitiesLogger from "../../socities.logger";
import { AddNoticeReqBody, NoticeResponse } from "../../socities.types";
import {
  getNoticeValidation,
  noticeResponseValidation,
} from "../../socities.validation";

export const POST = async (
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> => {
  socitiesLogger.info(`POST /api/socities/${params.id}/notices`);
  socitiesLogger.debug("creating a new notice");

  const { reqBody, response } = await validationMiddleware<AddNoticeReqBody>(
    request,
    noticeResponseValidation,
    params
  );

  if (response) return response;

  const authResult = await authMiddleware(request);

  if (authResult instanceof NextResponse) return authResult;

  const { status, ...responseData }: Response<void> =
    await createNoticeController(request, reqBody, params.id);

  return NextResponse.json(responseData, { status });
};

export const GET = async (
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> => {
  socitiesLogger.info(`GET /api/socities/${params.id}/notices`);
  socitiesLogger.debug("getting notices");

  const { response } = await validationMiddleware(
    request,
    getNoticeValidation,
    params
  );

  if (response) return response;

  const authResult = await authMiddleware(request);

  if (authResult instanceof NextResponse) return authResult;

  const { status, ...responseData }: Response<NoticeResponse[]> =
    await getNoticesController(params.id);

  return NextResponse.json(responseData, { status });
};

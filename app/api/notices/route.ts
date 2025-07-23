import type { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { NextRequest, NextResponse } from "next/server";
import { NoticeResponse } from "../socities/socities.types";
import { getAllNotices } from "./notices.controller";
import noticesLogger from "./notices.logger";

export const GET = async (request: NextRequest): Promise<NextResponse> => {
  noticesLogger.debug("GET api/notices");
  noticesLogger.info("listing notices...");

  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  // Call the add flat controller with the validated request body
  const { status, ...responseData }: Response<NoticeResponse[]> =
    await getAllNotices();

  // Return the response from the add flat controller with the appropriate status code
  return NextResponse.json(responseData, { status });
};

import { authMiddleware } from "@/middlewares/auth-middleware";
import validationMiddleware from "@/middlewares/validation-middleware";
import { NextRequest, NextResponse } from "next/server";
import finesLogger from "../fines.logger";
import { getFinesValidation } from "../fines.validation";
import { Fines } from "../fines.types";
import type { Response } from "@/db/utils/response-generator";
import { getFinesController } from "../fines.controller";

export const GET = async (
  request: NextRequest,
  { params }: { params: { societyId: string } }
): Promise<NextResponse> => {
  finesLogger.info("GET /api/fines/:societyId");
  finesLogger.debug("getting fines");

  const { response } = await validationMiddleware<Fines>(
    request,
    getFinesValidation,
    params
  );

  // If validation fails, return the error response
  if (response) return response;

  // Authenticate the request
  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  const { status, ...responseData }: Response<Fines[]> =
    await getFinesController(request,params.societyId);

  // Return the response with the appropriate status code
  return NextResponse.json(responseData, { status });
};

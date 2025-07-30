import type { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import validationMiddleware from "@/middlewares/validation-middleware";
import { NextRequest, NextResponse } from "next/server";
import { bulkMonetizeController } from "../member-monthly-dues.controller";
import memberMonthlyDuesLogger from "../member-monthly-dues.logger";
import { BulkMonetizeReqBody } from "../member-monthly-dues.types";
import { bulkMonetizeValidation } from "../member-monthly-dues.validation";

export const PATCH = async (request: NextRequest): Promise<NextResponse> => {
  memberMonthlyDuesLogger.info("PATCH member-monthly-dues/bulk-monetize");
  memberMonthlyDuesLogger.debug(`bulk monetize dues for member`);

  const { reqBody, response } = await validationMiddleware<BulkMonetizeReqBody>(
    request,
    bulkMonetizeValidation
  );

  // If validation fails, return the error response
  if (response) return response;

  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  const { status, ...responseData }: Response<void> =
    await bulkMonetizeController(request, reqBody);

  // Return the response with the appropriate status code
  return NextResponse.json(responseData, { status });
};

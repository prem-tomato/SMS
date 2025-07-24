import type { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import validationMiddleware from "@/middlewares/validation-middleware";
import { NextRequest, NextResponse } from "next/server";
import {
  addExpenseTrackingController,
  getExpenseTrackingController,
} from "../../socities.controller";
import socitiesLogger from "../../socities.logger";
import {
  AddExpenseTrackingReqBody,
  ExpenseTrackingResponse,
} from "../../socities.types";
import { addExpenseTrackingValidation } from "../../socities.validation";

export const POST = async (
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> => {
  socitiesLogger.info("POST api/socities/[id]/expense-tracking");
  socitiesLogger.debug(`adding expense tracking to society ${params.id}`);

  // Step 1: Validate the request data
  const { reqBody, response } =
    await validationMiddleware<AddExpenseTrackingReqBody>(
      request,
      addExpenseTrackingValidation,
      params
    );

  // If validation fails, return the error response
  if (response) return response;

  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  // Step 2: If validation and authentication succeed, process the request
  const { status, ...responseData }: Response<void> =
    await addExpenseTrackingController(request, reqBody, params.id);

  // Return the response with the appropriate status code
  return NextResponse.json(responseData, { status });
};

export const GET = async (
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> => {
  socitiesLogger.info("GET api/socities/[id]/expense-tracking");
  socitiesLogger.debug(`getting expense tracking for society ${params.id}`);

  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  const { status, ...responseData }: Response<ExpenseTrackingResponse[]> =
    await getExpenseTrackingController(params.id);

  // Return the response with the appropriate status code
  return NextResponse.json(responseData, { status });
};

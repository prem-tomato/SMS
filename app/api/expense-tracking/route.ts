import type { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { NextRequest, NextResponse } from "next/server";
import { ExpenseTrackingResponse } from "../socities/socities.types";
import { getAllExpenseTrackingController } from "./expense.controller";
import expenseLogger from "./expense.logger";

export const GET = async (request: NextRequest): Promise<NextResponse> => {
  expenseLogger.info("GET api/expense-tracking");
  expenseLogger.debug(`getting expense tracking`);

  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  const { status, ...responseData }: Response<ExpenseTrackingResponse[]> =
    await getAllExpenseTrackingController();

  // Return the response with the appropriate status code
  return NextResponse.json(responseData, { status });
};

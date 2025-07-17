import type { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import validationMiddleware from "@/middlewares/validation-middleware";
import { NextRequest, NextResponse } from "next/server";
import {
  addSocietyController,
  listSocietiesController,
} from "./socities.controller";
import socitiesLogger from "./socities.logger";
import { AddSocietyReqBody, Societies } from "./socities.types";
import { addSocietyValidation } from "./socities.validation";

export const POST = async (request: NextRequest): Promise<NextResponse> => {
  socitiesLogger.info("POST /api/socities");
  socitiesLogger.debug("Creating a new society...");

  // Step 1: Validate the request data
  const { reqBody, response } = await validationMiddleware<AddSocietyReqBody>(
    request,
    addSocietyValidation
  );

  // If validation fails, return the error response
  if (response) return response;

  // Step 2: Verify the JWT token for authentication
  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  // // Step 3: Check permissions for the 'create' operation on 'bank_shift_type'
  // const permissionCheck: NextResponse | undefined = await checkPermission(
  //   "socities",
  //   "create"
  // )(request);

  // // If permission check fails, return a forbidden response
  // if (permissionCheck instanceof NextResponse) return permissionCheck;

  // Step 4: If validation, authentication, and permission check succeed, process the request
  const { status, ...responseData }: Response<Societies> =
    await addSocietyController(request, reqBody);

  // Return the response with the appropriate status code
  return NextResponse.json(responseData, { status });
};

export const GET = async (request: NextRequest): Promise<NextResponse> => {
  socitiesLogger.info("GET /api/socities");
  socitiesLogger.debug("Getting all societies...");

  // Step 1: Verify the JWT token for authentication
  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  const { status, ...responseData }: Response<Societies[]> =
    await listSocietiesController();

  // Return the response with the appropriate status code
  return NextResponse.json(responseData, { status });
};

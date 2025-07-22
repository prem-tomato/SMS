import type { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { NextRequest, NextResponse } from "next/server";
import {
  deleteSocietyController,
  getSocietiesController,
} from "../socities.controller";
import socitiesLogger from "../socities.logger";
import { Societies } from "../socities.types";

export const GET = async (
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> => {
  socitiesLogger.info("GET /api/socities");
  socitiesLogger.debug("Getting all societies...");

  // Step 1: Verify the JWT token for authentication
  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  // // Step 2: Check permissions for the 'read' operation on 'socities'
  // const permissionCheck: NextResponse | undefined = await checkPermission(
  //   "socities",
  //   "read"
  // )(request);

  // // If permission check fails, return a forbidden response
  // if (permissionCheck instanceof NextResponse) return permissionCheck;

  // Step 3: If validation, authentication, and permission check succeed, process the request
  const { status, ...responseData }: Response<Societies[]> =
    await getSocietiesController(request, params.id);

  // Return the response with the appropriate status code
  return NextResponse.json(responseData, { status });
};

export const DELETE = async (
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> => {
  socitiesLogger.info("DELETE /api/socities");
  socitiesLogger.debug("Deleting society...");

  // Step 1: Verify the JWT token for authentication
  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  // Step 3: If validation, authentication, and permission check succeed, process the request
  const { status, ...responseData }: Response<void> =
    await deleteSocietyController(params.id);

  // Return the response with the appropriate status code
  return NextResponse.json(responseData, { status });
};

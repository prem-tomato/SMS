import { getUserController } from "@/app/api/users/user.controller";
import { UserResponse } from "@/app/api/users/user.types";
import type { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import validationMiddleware from "@/middlewares/validation-middleware";
import { NextRequest, NextResponse } from "next/server";
import { addAdminController } from "../../socities.controller";
import socitiesLogger from "../../socities.logger";
import { AddAdminReqBody, AdminResponse } from "../../socities.types";
import { addAdminValidation } from "../../socities.validation";

export const POST = async (
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> => {
  socitiesLogger.info("POST api/socities/[id]/user");
  socitiesLogger.debug(`adding admin to society ${params.id}`);

  // Step 1: Validate the request data
  const { reqBody, response } = await validationMiddleware<AddAdminReqBody>(
    request,
    addAdminValidation,
    params
  );

  // If validation fails, return the error response
  if (response) return response;

  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  // Step 2: If validation and authentication succeed, process the request
  const { status, ...responseData }: Response<AdminResponse> =
    await addAdminController(request, reqBody, params.id);

  // Return the response with the appropriate status code
  return NextResponse.json(responseData, { status });
};

export const GET = async (
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> => {
  socitiesLogger.info("GET /api/societies/[id]/user");
  socitiesLogger.debug("Getting all users...");

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
  const { status, ...responseData }: Response<UserResponse[]> =
    await getUserController(params.id);

  // Return the response with the appropriate status code
  return NextResponse.json(responseData, { status });
};

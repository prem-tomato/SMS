import { getVacantUserController } from "@/app/api/users/user.controller";
import { UserResponse } from "@/app/api/users/user.types";
import type { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { NextRequest, NextResponse } from "next/server";
import socitiesLogger from "../../../socities.logger";

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
    await getVacantUserController(params.id);

  // Return the response with the appropriate status code
  return NextResponse.json(responseData, { status });
};

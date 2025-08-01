import type { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { NextRequest, NextResponse } from "next/server";
import { softDeleteSocietyController } from "../../socities.controller";
import socitiesLogger from "../../socities.logger";

export const DELETE = async (
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> => {
  socitiesLogger.info("DELETE /api/socities/[id]/delete-society");
  socitiesLogger.debug("Deleting society...");

  // Step 1: Verify the JWT token for authentication
  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  // Step 3: If validation, authentication, and permission check succeed, process the request
  const { status, ...responseData }: Response<void> =
    await softDeleteSocietyController(request, params.id);

  // Return the response with the appropriate status code
  return NextResponse.json(responseData, { status });
};

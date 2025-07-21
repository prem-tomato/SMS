import type { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { NextRequest, NextResponse } from "next/server";
import { getBuildingsController } from "../../../socities.controller";
import socitiesLogger from "../../../socities.logger";
import { Building } from "../../../socities.types";

export const GET = async (
  request: NextRequest,
  { params }: { params: { id: string; buildingId: string } }
): Promise<NextResponse> => {
  socitiesLogger.info("GET api/socities/[id]/building/[buildingId]");
  socitiesLogger.debug(
    `getting building ${params.buildingId} from society ${params.id}`
  );

  // Step 1: Verify the JWT token for authentication
  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  // Step 3: If validation, authentication, and permission check succeed, process the request
  const { status, ...responseData }: Response<Building[]> =
    await getBuildingsController(params);

  // Return the response with the appropriate status code
  return NextResponse.json(responseData, { status });
};

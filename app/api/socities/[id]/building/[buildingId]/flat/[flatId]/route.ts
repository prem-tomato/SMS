import { getFlatsController } from "@/app/api/socities/socities.controller";
import socitiesLogger from "@/app/api/socities/socities.logger";
import { Flat } from "@/app/api/socities/socities.types";
import type { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  request: NextRequest,
  { params }: { params: { id: string; buildingId: string; flatId: string } }
): Promise<NextResponse> => {
  socitiesLogger.info(
    "GET api/socities/[id]/building/[buildingId]/flat/[flatId]"
  );
  socitiesLogger.debug(
    `GET flat ${params.flatId} in building ${params.buildingId} in society ${params.id}`
  );

  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  // Step 3: If validation, authentication, and permission check succeed, process the request
  const { status, ...responseData }: Response<Flat[]> =
    await getFlatsController(params);

  // Return the response with the appropriate status code
  return NextResponse.json(responseData, { status });
};

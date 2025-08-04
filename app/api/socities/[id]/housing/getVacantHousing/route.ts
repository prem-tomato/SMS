import type { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { NextRequest, NextResponse } from "next/server";
import { getVacantHousingController } from "../../../socities.controller";
import socitiesLogger from "../../../socities.logger";
import { HousingOptions } from "../../../socities.types";

export const GET = async (
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> => {
  socitiesLogger.info("GET api/socities/[id]/building/[buildingId]/flat");
  socitiesLogger.debug(`getting flats from society ${params.id}`);

  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  // Step 3: If validation, authentication, and permission check succeed, process the request
  const { status, ...responseData }: Response<HousingOptions[]> =
    await getVacantHousingController(params.id);

  // Return the response with the appropriate status code
  return NextResponse.json(responseData, { status });
};

import { listHousingPenaltiesController } from "@/app/api/socities/socities.controller";
import socitiesLogger from "@/app/api/socities/socities.logger";
import { HousingUnitPenalty } from "@/app/api/socities/socities.types";
import type { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  request: NextRequest,
  {
    params,
  }: {
    params: {
      id: string;
      housingId: string;
    };
  }
): Promise<NextResponse> => {
  socitiesLogger.info("GET api/socities/[id]/housing/[housingId]/penalty/list");
  socitiesLogger.debug(
    `listing flats penalties in building ${params.housingId}, society ${params.id}`
  );

  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  // Step 4: If validation, authentication, and permission check succeed, process the request
  const { status, ...responseData }: Response<HousingUnitPenalty[]> =
    await listHousingPenaltiesController(params.id, params.housingId);

  // Return the response with the appropriate status code
  return NextResponse.json(responseData, { status });
};

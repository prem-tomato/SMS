import { updateHousingPenaltyController } from "@/app/api/socities/socities.controller";
import socitiesLogger from "@/app/api/socities/socities.logger";
import type { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { NextRequest, NextResponse } from "next/server";

export const PATCH = async (
  request: NextRequest,
  {
    params,
  }: {
    params: {
      id: string;
      housingId: string;
      penaltyId: string;
    };
  }
): Promise<NextResponse> => {
  socitiesLogger.info(
    "PATCH api/socities/[id]/housing/[housingId]/penalty/[penaltyId]/paid"
  );
  socitiesLogger.debug(
    `updating flats penalties in building ${params.housingId}, society ${params.id} and flat ${params.penaltyId} mark as paid`
  );

  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  // Step 4: If validation, authentication, and permission check succeed, process the request
  const { status, ...responseData }: Response<void> =
    await updateHousingPenaltyController(
      request,
      params.id,
      params.housingId,
      params.penaltyId
    );

  // Return the response with the appropriate status code
  return NextResponse.json(responseData, { status });
};

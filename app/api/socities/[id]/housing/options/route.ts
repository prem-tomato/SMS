import { authMiddleware } from "@/middlewares/auth-middleware";
import { NextRequest, NextResponse } from "next/server";
import { listSocietiesHousingOptionsController } from "../../../socities.controller";
import socitiesLogger from "../../../socities.logger";
import { SocietyOptions } from "../../../socities.types";
import type { Response } from "@/db/utils/response-generator";

export const GET = async (
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> => {
  socitiesLogger.info(`GET /api/socities/[societyId]/housing/options`);
  socitiesLogger.debug(`Getting all societies ${params.id} housing options...`);

  // Step 1: Verify the JWT token for authentication
  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  const { status, ...responseData }: Response<SocietyOptions[]> =
    await listSocietiesHousingOptionsController(params.id);

  // Return the response with the appropriate status code
  return NextResponse.json(responseData, { status });
};

import type { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { NextRequest, NextResponse } from "next/server";
import { listSocietiesHousingOptionsController, listSocietiesOptionsForFlatController } from "../../socities.controller";
import socitiesLogger from "../../socities.logger";
import { SocietyOptions } from "../../socities.types";

export const GET = async (request: NextRequest): Promise<NextResponse> => {
  socitiesLogger.info("GET /api/socities/options/flats");
  socitiesLogger.debug("Getting all societies housing options...");

  // Step 1: Verify the JWT token for authentication
  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  const { status, ...responseData }: Response<SocietyOptions[]> =
    await listSocietiesOptionsForFlatController();

  // Return the response with the appropriate status code
  return NextResponse.json(responseData, { status });
};

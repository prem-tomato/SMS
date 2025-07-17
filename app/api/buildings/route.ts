import type { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { NextRequest, NextResponse } from "next/server";
import { listBuildingsController } from "./buildings.controller";
import buildingLogger from "./buildings.logger";
import { ListBuildingResponse } from "./buildings.types";

export const GET = async (request: NextRequest): Promise<NextResponse> => {
  buildingLogger.info("GET /api/buildings");
  buildingLogger.debug("Getting all buildings...");

  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  const { status, ...responseData }: Response<ListBuildingResponse[]> =
    await listBuildingsController();

  // Return the response with the appropriate status code
  return NextResponse.json(responseData, { status });
};

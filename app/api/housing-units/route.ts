import type { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { NextRequest, NextResponse } from "next/server";
import { HousingUnits } from "../socities/socities.types";
import { getAllHousingUnits } from "./housing.controller";
import housingLogger from "./housing.logger";

export const GET = async (request: NextRequest): Promise<NextResponse> => {
  housingLogger.debug("GET api/housing-units");
  housingLogger.info("listing housing units...");

  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  // Call the add flat controller with the validated request body
  const { status, ...responseData }: Response<HousingUnits[]> =
    await getAllHousingUnits();

  // Return the response from the add flat controller with the appropriate status code
  return NextResponse.json(responseData, { status });
};

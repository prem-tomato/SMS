import type { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { NextRequest, NextResponse } from "next/server";
import { getAllFlats } from "./flats.controller";
import flatsLogger from "./flats.logger";
import { GetAllFlats } from "./flats.types";

export const GET = async (request: NextRequest): Promise<NextResponse> => {
  flatsLogger.debug("GET api/flats");
  flatsLogger.info("listing flats...");

  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  // Call the add flat controller with the validated request body
  const { status, ...responseData }: Response<GetAllFlats[]> =
    await getAllFlats();

  // Return the response from the add flat controller with the appropriate status code
  return NextResponse.json(responseData, { status });
};

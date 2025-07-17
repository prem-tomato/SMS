import type { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import validationMiddleware from "@/middlewares/validation-middleware";
import { NextRequest, NextResponse } from "next/server";
import {
  addBuildingControllerAnother,
  listBuildingsController,
} from "./buildings.controller";
import buildingLogger from "./buildings.logger";
import {
  AddBuildingReqBodyAnother,
  ListBuildingResponse,
} from "./buildings.types";
import { addBuildingValidationAnother } from "./buildings.validation";

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

export const POST = async (request: NextRequest): Promise<NextResponse> => {
  buildingLogger.info("POST api/buildings");
  buildingLogger.debug(`adding building to society`);

  const { reqBody, response } =
    await validationMiddleware<AddBuildingReqBodyAnother>(
      request,
      addBuildingValidationAnother
    );

  // If validation fails, return the error response
  if (response) return response;

  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  // Step 2: If validation and authentication succeed, process the request
  const { status, ...responseData }: Response<void> =
    await addBuildingControllerAnother(request, reqBody);

  // Return the response with the appropriate status code
  return NextResponse.json(responseData, { status });
};

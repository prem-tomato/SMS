import type { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import validationMiddleware from "@/middlewares/validation-middleware";
import { NextRequest, NextResponse } from "next/server";
import { getBuildingsController } from "../../../socities.controller";
import socitiesLogger from "../../../socities.logger";
import { Building } from "../../../socities.types";
import {
  deleteBuildingsController,
  updateBuildingsController,
} from "./building.controller";
import { UpdateBuildingReqBody } from "./building.types";
import { updateBuildingValidation } from "./building.validation";

export const GET = async (
  request: NextRequest,
  { params }: { params: { id: string; buildingId: string } }
): Promise<NextResponse> => {
  socitiesLogger.info("GET api/socities/[id]/building/[buildingId]");
  socitiesLogger.debug(
    `getting building ${params.buildingId} from society ${params.id}`
  );

  // Step 1: Verify the JWT token for authentication
  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  // Step 3: If validation, authentication, and permission check succeed, process the request
  const { status, ...responseData }: Response<Building[]> =
    await getBuildingsController(params);

  // Return the response with the appropriate status code
  return NextResponse.json(responseData, { status });
};

export const PATCH = async (
  request: NextRequest,
  { params }: { params: { id: string; buildingId: string } }
): Promise<NextResponse> => {
  socitiesLogger.info("PATCH api/socities/[id]/building/[buildingId]");
  socitiesLogger.debug(
    `updating building ${params.buildingId} from society ${params.id}`
  );

  const { reqBody, response } =
    await validationMiddleware<UpdateBuildingReqBody>(
      request,
      updateBuildingValidation,
      params
    );

  // If validation fails, return the error response
  if (response) return response;

  // Step 1: Verify the JWT token for authentication
  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  const { status, ...responseData }: Response<void> =
    await updateBuildingsController(
      request,
      params.buildingId,
      params.id,
      reqBody
    );

  return NextResponse.json(responseData, { status });
};

export const DELETE = async (
  request: NextRequest,
  { params }: { params: { id: string; buildingId: string } }
): Promise<NextResponse> => {
  socitiesLogger.info("DELETE api/socities/[id]/building/[buildingId]");
  socitiesLogger.debug(
    `deleting building ${params.buildingId} from society ${params.id}`
  );

  // Step 1: Verify the JWT token for authentication
  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  const { status, ...responseData }: Response<void> =
    await deleteBuildingsController(params.buildingId, params.id);

  return NextResponse.json(responseData, { status });
};

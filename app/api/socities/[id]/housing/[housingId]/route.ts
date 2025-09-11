import type { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import validationMiddleware from "@/middlewares/validation-middleware";
import { NextRequest, NextResponse } from "next/server";
import { updateHousingUnitController } from "../../../socities.controller";
import socitiesLogger from "../../../socities.logger";
import { UpdateHousingUnitReqBody } from "../../../socities.types";
import { updateHousingUnitValidation } from "../../../socities.validation";

export const PATCH = async (
  request: NextRequest,
  { params }: { params: { id: string; housingId: string } }
) => {
  socitiesLogger.info("PATCH /api/socities/:id/housing/:housingId");
  socitiesLogger.debug("Updating a housing unit...");

  const { reqBody, response } =
    await validationMiddleware<UpdateHousingUnitReqBody>(
      request,
      updateHousingUnitValidation,
      params
    );

  // If validation fails, return the error response
  if (response) return response;

  // Step 1: Verify the JWT token for authentication
  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  const { status, ...responseData }: Response<void> =
    await updateHousingUnitController(
      request,
      params.housingId,
      params.id,
      reqBody
    );

  return NextResponse.json(responseData, { status });
};

// export const DELETE = async (
//   request: NextRequest,
//   { params }: { params: { id: string; housingId: string } }
// ) => {
//   socitiesLogger.info("DELETE /api/socities/:id/housing/:housingId");
//   socitiesLogger.debug("Deleting a housing unit...");
// };

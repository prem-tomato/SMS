import { updateMonthlyDuesValidationController } from "@/app/api/socities/socities.controller";
import socitiesLogger from "@/app/api/socities/socities.logger";
import { UpdateMonthlyDuesReqBody } from "@/app/api/socities/socities.types";
import { updateMonthlyDuesValidation } from "@/app/api/socities/socities.validation";
import type { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import validationMiddleware from "@/middlewares/validation-middleware";
import { NextRequest, NextResponse } from "next/server";

export const PATCH = async (
  request: NextRequest,
  { params }: { params: { id: string; buildingId: string; flatId: string } }
): Promise<NextResponse> => {
  socitiesLogger.info(
    "POST api/socities/[id]/building/[buildingId]/flat/[flatId]/monetize-dues"
  );
  socitiesLogger.debug(`monetize dues for flat ${params.flatId}`);

  const { reqBody, response } =
    await validationMiddleware<UpdateMonthlyDuesReqBody>(
      request,
      updateMonthlyDuesValidation,
      params
    );

  // If validation fails, return the error response
  if (response) return response;

  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  const { status, ...responseData }: Response<void> =
    await updateMonthlyDuesValidationController(request, reqBody, params);

  // Return the response with the appropriate status code
  return NextResponse.json(responseData, { status });
};

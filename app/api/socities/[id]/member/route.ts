import type { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import validationMiddleware from "@/middlewares/validation-middleware";
import { NextRequest, NextResponse } from "next/server";
import { addMemberController } from "../../socities.controller";
import socitiesLogger from "../../socities.logger";
import { AddMemberReqBody, MemberResponse } from "../../socities.types";
import { addMemberValidation } from "../../socities.validation";

export const POST = async (
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> => {
  socitiesLogger.info("POST api/socities/[id]/member");
  socitiesLogger.debug(`adding member to society ${params.id}`);

  // Step 1: Validate the request data
  const { reqBody, response } = await validationMiddleware<AddMemberReqBody>(
    request,
    addMemberValidation,
    params
  );

  // If validation fails, return the error response
  if (response) return response;

  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  // Step 2: If validation and authentication succeed, process the request
  const { status, ...responseData }: Response<MemberResponse> =
    await addMemberController(request, reqBody, params.id);

  // Return the response with the appropriate status code
  return NextResponse.json(responseData, { status });
};

import type { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import validationMiddleware from "@/middlewares/validation-middleware";
import { NextRequest, NextResponse } from "next/server";
import { listAssignedMemberValidation } from "../assigned-member.validation";
import { getAllAssignedMembersForAdmin } from "../assigned-members.controller";
import assignedMemberLogger from "../assigned-members.logger";
import { AssignedMemberResponse } from "../assigned-members.types";

export const GET = async (
  request: NextRequest,
  { params }: { params: { societyId: string } }
): Promise<NextResponse> => {
  assignedMemberLogger.info("GET api/assigned-members/[societyId]");
  assignedMemberLogger.debug(
    `listing assigned members for society ${params.societyId}`
  );

  const { response } = await validationMiddleware(
    request,
    listAssignedMemberValidation,
    params
  );

  // If validation fails, return the error response
  if (response) return response;

  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  // Step 2: If validation and authentication succeed, process the request
  const { status, ...responseData }: Response<AssignedMemberResponse[]> =
    await getAllAssignedMembersForAdmin(params.societyId);

  // Return the response with the appropriate status code
  return NextResponse.json(responseData, { status });
};

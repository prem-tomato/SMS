import type { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { NextRequest, NextResponse } from "next/server";
import { getAllAssignedMembers } from "./assigned-members.controller";
import assignedMemberLogger from "./assigned-members.logger";
import { AssignedMemberResponse } from "./assigned-members.types";

export const GET = async (request: NextRequest): Promise<NextResponse> => {
  assignedMemberLogger.debug("GET api/assigned-members");
  assignedMemberLogger.info("listing assigned members...");

  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  // Call the add flat controller with the validated request body
  const { status, ...responseData }: Response<AssignedMemberResponse[]> =
    await getAllAssignedMembers();

  // Return the response from the add flat controller with the appropriate status code
  return NextResponse.json(responseData, { status });
};

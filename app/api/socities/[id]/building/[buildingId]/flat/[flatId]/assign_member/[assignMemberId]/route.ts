import assignedMemberLogger from "@/app/api/assigned-members/assigned-members.logger";
import type { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { NextRequest, NextResponse } from "next/server";
import { deleteAssignMemberController } from "../../../../building.controller";

export const DELETE = async (
  request: NextRequest,
  {
    params,
  }: {
    params: {
      id: string;
      buildingId: string;
      flatId: string;
      assignMemberId: string;
    };
  }
) => {
  assignedMemberLogger.info(
    "DELETE api/socities/[id]/building/[buildingId]/flat/[flatId]/assign_member/[assignMemberId]"
  );
  assignedMemberLogger.debug(
    `unassigning member ${params.assignMemberId} from flat ${params.flatId}`
  );

  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  const { status, ...responseData }: Response<void> =
    await deleteAssignMemberController(request, params);

  // Return the response with the appropriate status code
  return NextResponse.json(responseData, { status });
};

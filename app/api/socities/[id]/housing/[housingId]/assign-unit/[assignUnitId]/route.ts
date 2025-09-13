import assignedMemberLogger from "@/app/api/assigned-members/assigned-members.logger";
import { deleteAssignUnitController } from "@/app/api/socities/socities.controller";
import type { Response } from "@/db/utils/response-generator";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { NextRequest, NextResponse } from "next/server";

export const DELETE = async (
  request: NextRequest,
  {
    params,
  }: {
    params: {
      id: string;
      housingId: string;
      assignUnitId: string;
    };
  }
) => {
  assignedMemberLogger.info(
    "DELETE api/socities/[id]/housing/[housingId]/assign-unit/[assignUnitId]"
  );
  assignedMemberLogger.debug(
    `unassigning unit ${params.assignUnitId} from housing ${params.housingId}`
  );

  const authResult = await authMiddleware(request);

  // If authentication fails, return the error response
  if (authResult instanceof Response) return authResult;

  const { status, ...responseData }: Response<void> =
    await deleteAssignUnitController(request, params);
  // Return the response with the appropriate status code
  return NextResponse.json(responseData, { status });
};

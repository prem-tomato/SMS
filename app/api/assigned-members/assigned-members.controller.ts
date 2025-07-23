import getMessage from "@/db/utils/messages";
import { generateResponseJSON, Response } from "@/db/utils/response-generator";
import { StatusCodes } from "http-status-codes";
import assignedMemberLogger from "./assigned-members.logger";
import { listAllAssignedMembers } from "./assigned-members.model";
import { AssignedMemberResponse } from "./assigned-members.types";

export const getAllAssignedMembers = async (): Promise<
  Response<AssignedMemberResponse[]>
> => {
  try {
    const assignedMembers: AssignedMemberResponse[] =
      await listAllAssignedMembers();

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("LIST_SUCCESSFULL"),
      assignedMembers
    );
  } catch (error: any) {
    assignedMemberLogger.error("Error in addUserController:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

export const getAllAssignedMembersForAdmin = async (
  societyId: string
): Promise<Response<AssignedMemberResponse[]>> => {
  try {
    const assignedMembers: AssignedMemberResponse[] =
      await listAllAssignedMembers(societyId);

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("LIST_SUCCESSFULL"),
      assignedMembers
    );
  } catch (error: any) {
    assignedMemberLogger.error("Error in addUserController:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

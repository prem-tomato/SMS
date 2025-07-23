import { AssignFlatMembers } from "../socities/socities.types";

export type AssignedMemberResponse = Pick<
  AssignFlatMembers,
  "id" | "move_in_date" | "created_by" | "created_at"
> & {
  member_name: string;
  society_name: string;
  building_name: string;
  flat_number: string;
};

import { object } from "zod";
import { idValidation } from "../socities/socities.validation";

export const listAssignedMemberValidation = object({
  params: object({
    societyId: idValidation,
  }),
});

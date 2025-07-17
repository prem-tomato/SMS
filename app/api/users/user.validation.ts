import { userRoleType } from "@/db/utils/enums/enum";
import { number, object, string } from "zod";
import { idValidation } from "../socities/socities.validation";

export const addUserValidation = object({
  body: object({
    role: userRoleType,
    society_id: idValidation,
    login_key: number().min(1).max(6),
    first_name: string(),
    last_name: string(),
    phone: string(),
  }),
});

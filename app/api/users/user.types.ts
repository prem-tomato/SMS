import { userRoleType } from "@/db/utils/enums/enum";
import z from "zod";
import { addUserValidation } from "./user.validation";

export type User = {
  id: string;
  role: typeof userRoleType;
  society_id: string;
  login_key: number;
  first_name: string;
  last_name: string;
  phone: string;
  created_at: string;
  is_deleted: boolean;
  created_by: string;
};

export type AddUserReqBody = z.infer<typeof addUserValidation.shape.body>;

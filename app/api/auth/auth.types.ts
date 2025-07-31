import { societyType, userRoleType } from "@/db/utils/enums/enum";
import z from "zod";
import { loginValidation } from "./auth.validation";

export type User = {
  id: string;
  role: (typeof userRoleType)[keyof typeof userRoleType];
  society_id: string;
  first_name: string;
  last_name: string;
  login_key: number;
  phone: number;
  status: string;
  created_at: Date;
  created_by: string;
};

export type LoginBody = z.infer<typeof loginValidation.shape.body>;

export type LoginResponse = {
  access_token: string;
  role: (typeof userRoleType)[keyof typeof userRoleType];
  societyId: string;
  societyType: (typeof societyType)[keyof typeof societyType] | undefined;
  user: Pick<User, "id" | "first_name" | "last_name" | "phone">;
};

export interface UserAgentData {
  browser: string;
  os: string;
  device: string;
  clientIp: string;
  latitude: number;
  longitude: number;
  location: string;
}

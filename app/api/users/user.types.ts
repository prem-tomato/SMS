import { User } from "../auth/auth.types";

export type UserResponse = Pick<
  User,
  "id" | "role" | "first_name" | "last_name" | "phone"
> & {
  society_name: string;
};
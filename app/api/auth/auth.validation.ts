import { number, object, string } from "zod";

export const loginValidation = object({
  body: object({
    society_key: string(),
    login_key: string(),
  }),
});

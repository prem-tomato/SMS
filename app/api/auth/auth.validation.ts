import { number, object, string } from "zod";

export const loginValidation = object({
  body: object({
    societyKey: string(),
    login_key: number().int(),
  }),
});

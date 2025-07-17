import { object, number } from "zod";

export const loginValidation = object({
    body: object({
      login_key: number().int(),
    }),
  });
  
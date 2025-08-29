import { object } from "zod";
import { idValidation } from "../socities/socities.validation";

export const getFinesValidation = object({
  params: object({
    societyId: idValidation,
  }),
});

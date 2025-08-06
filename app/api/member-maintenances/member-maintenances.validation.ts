import { object } from "zod";
import { idValidation } from "../socities/socities.validation";

export const memberMaintenanceValidationSchema = object({
  params: object({
    societyId: idValidation,
  }),
});

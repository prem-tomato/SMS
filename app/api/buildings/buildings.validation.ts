import { number, object, string } from "zod";
import { idValidation } from "../socities/socities.validation";

export const getBuildingOptionsValidation = object({
  params: object({
    societyId: idValidation,
  }),
});

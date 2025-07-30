import { array, object } from "zod";
import { idValidation } from "../socities/socities.validation";

export const bulkMonetizeValidation = object({
  body: object({
    ids: array(idValidation).nonempty(),
  }),
});

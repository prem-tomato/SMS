import { number, object, string } from "zod";
import { idValidation } from "../../../socities.validation";

export const updateBuildingValidation = object({
  params: object({
    id: idValidation,
    buildingId: idValidation,
  }),
  body: object({
    name: string().optional(),
    total_floors: number().optional(),
  }),
});

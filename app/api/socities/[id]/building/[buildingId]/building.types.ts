import z from "zod";
import { updateFlatValidation } from "./building.validation";

export type UpdateBuildingReqBody = {
  name?: string;
  total_floors?: number;
};

export type UpdateFlatReqBody = z.infer<typeof updateFlatValidation.shape.body>;

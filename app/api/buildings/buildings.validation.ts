import { number, object, string } from "zod";
import { idValidation } from "../socities/socities.validation";

export const addBuildingValidationAnother = object({
  body: object({
    society_id: idValidation,
    name: string()
      .min(1, "Building name is required")
      .max(100, "Building name must be less than 100 characters"),
    total_floors: number()
      .int("Total floors must be an integer")
      .min(1, "Total floors must be at least 1"),
  }),
});

export const getBuildingOptionsValidation = object({
  params: object({
    societyId: idValidation,
  }),
});

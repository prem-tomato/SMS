import { array, number, object, string } from "zod";
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

export const updateFlatValidation = object({
  params: object({
    id: idValidation,
    buildingId: idValidation,
    flatId: idValidation,
  }),
  body: object({
    flat_number: string()
      .min(1, "Flat number is required")
      .max(10, "Flat number must be less than 10 characters"),
    floor_number: number().int("Floor number must be an integer"),
    square_foot: number()
      .int("Square foot must be an integer")
      .min(1, "Square foot must be at least 1"),
    pending_maintenance: array(
      object({
        amount: number().optional(),
        reason: string().optional(),
      }).optional()
    ).optional(),
    current_maintenance: number()
      .min(0, "Current maintenance must be greater than or equal to 0")
      .max(1000000, "Current maintenance must be less than or equal to 1000000")
      .optional(),
  }),
});

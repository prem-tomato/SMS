import { flatMaintenanceType } from "@/db/utils/enums/enum";
import {
  array,
  discriminatedUnion,
  enum as enum_,
  literal,
  number,
  object,
  string,
} from "zod";

const monthAmountSchema = object({
  month: number().int().min(1).max(12),
  amount: number().positive(),
});

const baseSchema = object({
  amount_type: enum_(flatMaintenanceType),
});

const specificSchema = discriminatedUnion("amount_type", [
  object({
    amount_type: literal("settlement"),
    settlement_amount: number().positive(),
  }),
  object({
    amount_type: literal("quarterly"), 
    months: array(monthAmountSchema).length(3),
  }),
  object({
    amount_type: literal("halfyearly"),
    months: array(monthAmountSchema).length(6),
  }),
  object({
    amount_type: literal("yearly"),
    months: array(monthAmountSchema).length(12),
  }),
]);

export const manageFlatMaintenanceValidation = object({
  params: object({
    flatMaintenanceId: string().uuid(),
  }),
  body: baseSchema.and(specificSchema),
});

export const updateMonthlyMaintenanceValidation = object({
  params: object({
    flatMaintenanceId: string().uuid(),
    monthlyMaintenanceId: string().uuid(),
  }),
});

export const updateSettlementValidation = object({
  params: object({
    flatMaintenanceId: string().uuid(),
    settlementId: string().uuid(),
  }),
});
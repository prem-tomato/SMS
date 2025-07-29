import { flatMaintenanceType } from "@/db/utils/enums/enum";
import z from "zod";
import { manageFlatMaintenanceValidation } from "./flat-maintenance.validation";
export type FlatMaintenance = {
  id: string;
  society_id: string;
  building_id: string;
  flat_id: string;
  amount_type: (typeof flatMaintenanceType)[keyof typeof flatMaintenanceType];
  amount: number;
  reason: string;
  is_deleted: boolean;
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
  deleted_by: string;
  deleted_at: string;
};

export type FlatMaintenanceSettlement = {
  id: string;
  maintenance_id: string;
  settlement_amount: number;
  created_at: string;
};

export type FlatMaintenanceMonthly = {
  id: string;
  maintenance_id: string;
  month: number;
  amount: number;
  created_at: string;
};

export type ManageFLatMaintenance = z.infer<
  typeof manageFlatMaintenanceValidation.shape.body
>;

import z from "zod";
import { bulkMonetizeValidation } from "./member-monthly-dues.validation";

export type MemberMonthlyDues = {
  id: string;
  society_id: string;
  building_id: string;
  flat_id: string;
  member_ids: string[];
  month_year: string;
  maintenance_amount: number;
  maintenance_paid: boolean;
  maintenance_paid_at: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
  housing_id: string;
};

export type GetMemberMonthlyDuesResponse = Pick<
  MemberMonthlyDues,
  | "id"
  | "society_id"
  | "building_id"
  | "flat_id"
  | "member_ids"
  | "month_year"
  | "maintenance_amount"
  | "maintenance_paid"
  | "maintenance_paid_at"
> & {
  society_name: string;
  building_name: string;
  flat_number: string;
  member_name: string[];
  action_by: string;
  action_at: string;
};

export type BulkMonetizeReqBody = z.infer<
  typeof bulkMonetizeValidation.shape.body
>;

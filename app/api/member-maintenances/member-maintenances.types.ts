import { MemberMonthlyDues } from "../member-monthly-dues/member-monthly-dues.types";

export type GetMemberMaintenance = Pick<
  MemberMonthlyDues,
  | "id"
  | "member_ids"
  | "society_id"
  | "housing_id"
  | "building_id"
  | "flat_id"
  | "maintenance_amount"
  | "month_year"
  | "maintenance_paid"
  | "maintenance_paid_at"
  | "created_at"
  | "created_by"
  | "updated_at"
  | "updated_by"
> & {
  society_name: string;
  member_names: string[];
  building_name: string;
  flat_number: string;
  housing_unit_number: string;
  user_ids: string[];
};

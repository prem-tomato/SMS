import z from "zod";
import { User } from "../auth/auth.types";
import {
  addAdminValidation,
  addBuildingValidation,
  addFlatValidation,
  addMemberValidation,
  addSocietyValidation,
  assignMemberValidation,
} from "./socities.validation";

export type Societies = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  created_by: string;
  created_at: string;
};

export type Building = {
  id: string;
  society_id: string;
  name: string;
  total_floors: number;
  created_at: string;
  created_by: string;
};

export type Flat = {
  id: string;
  building_id: string;
  flat_number: string;
  floor_number: number;
  is_occupied: boolean;
  created_at: string;
  created_by: string;
};

export type AssignFlatMembers = {
  id: string;
  society_id: string;
  building_id: string;
  flat_id: string;
  user_id: string;
  move_in_date: Date;
  created_at: string;
  created_by: string;
};

export type AddSocietyReqBody = z.infer<typeof addSocietyValidation.shape.body>;

export type AddAdminReqBody = z.infer<typeof addAdminValidation.shape.body>;

export type AdminResponse = {
  data: Pick<User, "role" | "first_name" | "phone"> & {
    society_name: string;
  };
};

export type AddMemberReqBody = z.infer<typeof addMemberValidation.shape.body>;

export type MemberResponse = {
  data: Pick<User, "role" | "first_name" | "phone"> & {
    society_name: string;
  };
};

export type AddBuildingReqBody = z.infer<
  typeof addBuildingValidation.shape.body
>;

export type BuildingResponse = {
  data: Pick<Building, "total_floors"> & {
    building_name: string;
    society_name: string;
  };
};

export type AddFlatReqBody = z.infer<typeof addFlatValidation.shape.body>;

export type FlatResponse = {
  data: Pick<Flat, "flat_number" | "floor_number"> & {
    society_name: string;
    building_name: string;
  };
};

export type AssignMemberReqBody = z.infer<
  typeof assignMemberValidation.shape.body
>;

export type AssignMemberResponse = {
  data: Pick<AssignFlatMembers, "move_in_date"> & {
    member_name: string;
    society_name: string;
    building_name: string;
    flat_number: string;
  };
};

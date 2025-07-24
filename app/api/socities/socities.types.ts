import z from "zod";
import { User } from "../auth/auth.types";
import {
  addAdminValidation,
  addBuildingValidation,
  addEndDateValidation,
  addFlatValidation,
  addMemberValidation,
  addSocietyValidation,
  assignMemberValidation,
  noticeResponseValidation,
} from "./socities.validation";

export type Societies = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  end_date: Date;
  opening_balance: number;
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
  society_id: string;
  building_id: string;
  flat_number: string;
  floor_number: number;
  is_occupied: boolean;
  square_foot: number;
  pending_maintenance: {
    amount: number;
    reason: string;
  }[];  
  current_maintenance: number;
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

export type BuildingResponseForSociety = {
  data: Pick<Building, "id" | "total_floors"> & {
    building_name: string;
    society_name: string;
    action_by: string;
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

export type SocietyOptions = Pick<Societies, "id" | "name">;

export type FlatOptions = Pick<
  Flat,
  "id" | "flat_number" | "floor_number" | "is_occupied"
> & {
  society_name: string;
  building_name: string;
};

export type AssignedFlatOptions = Pick<
  Flat,
  "id" | "flat_number" | "floor_number" | "is_occupied"
> & {
  members: {
    last_name: string;
    first_name: string;
  }[];
  society_name: string;
  building_name: string;
};

export type Notices = {
  id: string;
  society_id: string;
  status: string;
  title: string;
  content: string;
  created_at: string;
  created_by: string;
};

export type AddNoticeReqBody = z.infer<
  typeof noticeResponseValidation.shape.body
>;

export type NoticeResponse = {
  data: Pick<Notices, "id" | "title" | "content" | "created_at"> & {
    society_id: string;
    society_name: string;
    created_by: string;
    status: string;
  };
};

export type AddEndDateReqBody = z.infer<typeof addEndDateValidation.shape.body>;

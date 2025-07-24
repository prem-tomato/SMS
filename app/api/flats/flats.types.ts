import { Flat } from "../socities/socities.types";

export type GetAllFlats = Pick<
  Flat,
  | "id"
  | "flat_number"
  | "floor_number"
  | "is_occupied"
  | "square_foot"
  | "pending_maintenance"
  | "current_maintenance"
> & {
  society_name: string;
  building_name: string;
};

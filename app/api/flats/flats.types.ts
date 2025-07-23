import { Flat } from "../socities/socities.types";

export type GetAllFlats = Pick<
  Flat,
  "id" | "flat_number" | "floor_number" | "is_occupied"
> & {
  society_name: string;
  building_name: string;
};

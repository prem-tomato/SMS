import { Building } from "../socities/socities.types";

export type ListBuildingResponse = Pick<Building, "name" | "total_floors"> & {
  society_name: string;
  action_by: string;
};

export type BuildingOptions = Pick<Building, "id" | "name" | "total_floors">;

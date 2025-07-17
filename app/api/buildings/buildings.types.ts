import z from "zod";
import { Building } from "../socities/socities.types";
import {
  addBuildingValidationAnother,
  getBuildingOptionsValidation,
} from "./buildings.validation";

export type ListBuildingResponse = Pick<Building, "name" | "total_floors"> & {
  society_name: string;
  action_by: string;
};

export type AddBuildingReqBodyAnother = z.infer<
  typeof addBuildingValidationAnother.shape.body
>;

export type BuildingOptions = Pick<Building, "id" | "name">;

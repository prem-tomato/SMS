import { addRoleType, memberType } from "@/db/utils/enums/enum";
import { array, enum as enum_, number, object, string } from "zod";

export const addSocietyValidation = object({
  body: object({
    name: string()
      .min(1, "Name is required")
      .max(100, "Name must be less than 100 characters"),
    address: string()
      .min(1, "Address is required")
      .max(255, "Address must be less than 255 characters"),
    city: string()
      .min(1, "City is required")
      .max(100, "City must be less than 100 characters"),
    state: string()
      .min(1, "State is required")
      .max(100, "State must be less than 100 characters"),
    country: string()
      .min(1, "Country is required")
      .max(100, "Country must be less than 100 characters"),
  }),
});

export const idValidation = string().uuid();

export const addAdminValidation = object({
  params: object({
    id: idValidation,
  }),
  body: object({
    role: enum_(addRoleType),
    first_name: string()
      .min(1, "First name is required")
      .max(50, "First name must be less than 50 characters"),
    last_name: string()
      .min(1, "Last name is required")
      .max(50, "Last name must be less than 50 characters"),
    login_key: number()
      .int("Login key must be an integer")
      .min(100000, "Login key must be at least 6 digits")
      .max(999999, "Login key must be at most 6 digits"),
    phone: string()
      .min(1, "Phone number is required")
      .max(20, "Phone number must be less than 20 characters"),
  }),
});

export const addMemberValidation = object({
  params: addAdminValidation.shape.params,
  body: addAdminValidation.shape.body.extend({
    role: enum_(memberType),
  }),
});

export const addBuildingValidation = object({
  params: object({
    id: idValidation,
  }),
  body: object({
    name: string()
      .min(1, "Building name is required")
      .max(100, "Building name must be less than 100 characters"),
    total_floors: number()
      .int("Total floors must be an integer")
      .min(1, "Total floors must be at least 1"),
  }),
});

export const addFlatValidation = object({
  params: object({
    id: idValidation,
    buildingId: idValidation,
  }),
  body: object({
    flat_number: string()
      .min(1, "Flat number is required")
      .max(10, "Flat number must be less than 10 characters"),
    floor_number: number()
      .int("Floor number must be an integer")
      .min(1, "Floor number must be at least 1"),
  }),
});

export const assignMemberValidation = object({
  params: object({
    id: idValidation,
    buildingId: idValidation,
    flatId: idValidation,
  }),
  body: object({
    user_id: array(idValidation),
    move_in_date: string().date(),
  }),
});

export const flatResponseValidation = object({
  params: object({
    id: idValidation,
    buildingId: idValidation,
  }),
});

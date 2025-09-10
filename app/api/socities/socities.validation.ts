import {
  addRoleType,
  expenseType,
  memberType,
  societyType,
} from "@/db/utils/enums/enum";
import z, { array, boolean, enum as enum_, number, object, string } from "zod";

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
    opening_balance: number()
      .min(0, "Opening balance must be greater than or equal to 0")
      .max(1000000, "Opening balance must be less than or equal to 1000000"),
    society_type: enum_(societyType),
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
    floor_number: number().int("Floor number must be an integer"),
    square_foot: number()
      .int("Square foot must be an integer")
      .min(1, "Square foot must be at least 1"),
    pending_maintenance: array(
      object({
        amount: number().optional(),
        reason: string().optional(),
      }).optional()
    ).optional(),
    current_maintenance: number()
      .min(0, "Current maintenance must be greater than or equal to 0")
      .max(
        1000000,
        "Current maintenance must be less than or equal to 1000000"
      ),
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

export const noticeResponseValidation = object({
  params: object({
    id: idValidation,
  }),
  body: object({
    title: string()
      .min(1, "Title is required")
      .max(100, "Title must be less than 100 characters"),
    content: string()
      .min(1, "Content is required")
      .max(255, "Content must be less than 255 characters"),
  }),
});

export const getNoticeValidation = object({
  params: object({
    id: idValidation,
  }),
});

export const toggleNoticeStatusValidation = object({
  params: object({
    id: idValidation,
    noticeId: idValidation,
  }),
});

export const addEndDateValidation = object({
  params: object({
    id: idValidation,
  }),
  body: object({
    end_date: string().date(),
  }),
});

export const addExpenseTrackingValidation = object({
  params: object({
    id: idValidation,
  }),
  body: object({
    expense_type: enum_(expenseType),
    expense_reason: string()
      .min(1, "Expense reason is required")
      .max(255, "Expense reason must be less than 255 characters"),
    expense_amount: number()
      .min(0, "Expense amount must be greater than or equal to 0")
      .max(100000000, "Expense amount must be less than or equal to 100000000"),
    expense_month: number().min(1, "Invalid month").max(12, "Invalid month"),
    expense_year: number()
      .min(2000, "Invalid year")
      .max(new Date().getFullYear() + 5, "Year too far in future"),
  }),
});

export const addIncomeTrackingValidation = object({
  params: object({
    id: idValidation,
  }),
  body: object({
    income_type: enum_(expenseType),
    income_reason: string()
      .min(1, "Income reason is required")
      .max(255, "Income reason must be less than 255 characters"),
    income_amount: number()
      .min(0, "Income amount must be greater than or equal to 0")
      .max(100000000, "Income amount must be less than or equal to 100000000"),
    income_month: number().min(1, "Invalid month").max(12, "Invalid month"),
    income_year: number()
      .min(2000, "Invalid year")
      .max(new Date().getFullYear() + 5, "Year too far in future"),
  }),
});

export const flatPenaltyValidation = object({
  params: object({
    id: idValidation,
    buildingId: idValidation,
    flatId: idValidation,
  }),
  body: object({
    amount: number()
      .min(0, "Amount must be greater than or equal to 0")
      .max(1000000, "Amount must be less than or equal to 1000000"),
    reason: string()
      .min(1, "Reason is required")
      .max(255, "Reason must be less than 255 characters"),
  }),
});

export const updateMonthlyDuesValidation = object({
  params: object({
    id: idValidation,
    buildingId: idValidation,
    flatId: idValidation,
  }),
  body: object({
    maintenance_paid: boolean(),
  }),
});

export const markFlatPenaltyPaidValidation = object({
  params: object({
    id: idValidation,
    buildingId: idValidation,
    flatId: idValidation,
    penaltyId: idValidation,
  }),
});

export const addHousingUnitValidation = object({
  params: object({
    id: idValidation,
  }),
  body: object({
    unit_number: string()
      .min(1, "Unit number is required")
      .max(20, "Unit number must be less than 20 characters"),
    unit_type: string()
      .min(1, "Unit type is required")
      .max(50, "Unit type must be less than 50 characters"),
    square_foot: number()
      .int("Square foot must be an integer")
      .min(1, "Square foot must be at least 1"),
    current_maintenance: number()
      .min(0, "Current maintenance must be greater than or equal to 0")
      .max(
        1000000,
        "Current maintenance must be less than or equal to 1000000"
      ),
  }),
});

export const assignHousingUnit = object({
  params: object({
    id: idValidation,
    housingId: idValidation,
  }),
  body: object({
    user_id: array(idValidation),
    move_in_date: string().date(),
  }),
});

export const addHousingUnitPenaltyValidation = object({
  params: object({
    id: idValidation,
    housingId: idValidation,
  }),
  body: object({
    amount: number()
      .min(0, "Amount must be greater than or equal to 0")
      .max(1000000, "Amount must be less than or equal to 1000000"),
    reason: string()
      .min(1, "Reason is required")
      .max(255, "Reason must be less than 255 characters"),
  }),
});

export const addRazorPayConfigValidation = object({
  params: object({
    id: idValidation,
  }),
  body: object({
    razorpay_key_id: string()
      .min(1, "Razorpay key id is required")
      .max(255, "Razorpay key id must be less than 255 characters"),
    razorpay_key_secret: string()
      .min(1, "Razorpay key secret is required")
      .max(255, "Razorpay key secret must be less than 255 characters"),
  }),
});

export const getRazorPayConfigValidation = object({
  params: object({
    id: idValidation,
  }),
});

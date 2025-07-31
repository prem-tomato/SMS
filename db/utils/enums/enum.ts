export const SUPER_ADMIN = "super_admin";
export const ADMIN = "admin";
export const MEMBER = "member";

export const userRoleType = {
  SUPER_ADMIN,
  ADMIN,
  MEMBER,
} as const;

export const addRoleType = {
  ADMIN,
  MEMBER,
};

export const adminType = {
  ADMIN,
} as const;

export const memberType = {
  MEMBER,
} as const;

export const FIXED = "fixed";
export const MONTHLY = "monthly";

export const expenseType = {
  FIXED,
  MONTHLY,
} as const;

export const SETTLEMENT = "settlement";
export const QUARTERLY = "quarterly";
export const HALFYEARLY = "halfyearly";
export const YEARLY = "yearly";

export const flatMaintenanceType = {
  SETTLEMENT,
  QUARTERLY,
  HALFYEARLY,
  YEARLY,
};

export const RESIDENTIAL = "residential";
export const COMMERCIAL = "commercial";

export const societyType = {
  RESIDENTIAL,
  COMMERCIAL,
};

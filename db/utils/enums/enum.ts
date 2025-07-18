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

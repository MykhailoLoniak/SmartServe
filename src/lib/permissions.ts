export const USER_ROLES = ["OWNER", "ADMIN", "STAFF", "WAITER", "KITCHEN"] as const;
export type UserRoleName = (typeof USER_ROLES)[number];

export const PERMISSIONS = [
  "manage_menu",
  "manage_restaurant",
  "manage_qr",
  "manage_users",
  "manage_orders",
  "update_kitchen_status",
  "close_bill",
  "view_dashboard",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const ROLE_PERMISSIONS: Record<UserRoleName, Permission[]> = {
  OWNER: [...PERMISSIONS],
  ADMIN: ["manage_menu", "manage_qr", "manage_orders", "view_dashboard", "manage_users"],
  STAFF: ["manage_orders", "view_dashboard"],
  WAITER: ["close_bill"],
  KITCHEN: ["update_kitchen_status"],
};

export const hasPermission = (role: UserRoleName, permission: Permission) => ROLE_PERMISSIONS[role].includes(permission);

export const getRolePermissions = (role: UserRoleName) => ROLE_PERMISSIONS[role];

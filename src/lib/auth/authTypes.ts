import type { UserRole } from "@prisma/client";

export type SmartServeRole = UserRole;

export type Membership = {
  restaurantId: number;
  role: UserRole;
};

export type AuthSession = {
  userId: number;
  email: string;
  name: string;
  memberships: Membership[];
};

export const SESSION_COOKIE_NAME = "smartserve_session";
export const SESSION_DURATION_MS = 1000 * 60 * 60 * 12;
export const SESSION_RENEW_WINDOW_MS = 1000 * 60 * 30;

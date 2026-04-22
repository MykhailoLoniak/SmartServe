import type { AuthSession, Membership } from "./authTypes";

type SessionFactoryInput = Partial<AuthSession> & {
  memberships?: Membership[];
};

export function createMembership(overrides: Partial<Membership> = {}): Membership {
  return {
    restaurantId: overrides.restaurantId ?? 1,
    role: overrides.role ?? "STAFF",
  };
}

export function createAuthSession(overrides: SessionFactoryInput = {}): AuthSession {
  return {
    userId: overrides.userId ?? 101,
    email: overrides.email ?? "user@smartserve.test",
    name: overrides.name ?? "Test User",
    memberships: overrides.memberships ?? [createMembership()],
  };
}

export function createMembershipsForAOnly(): Membership[] {
  return [createMembership({ restaurantId: 10, role: "STAFF" })];
}

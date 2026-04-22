import { forbidden, unauthorized } from "@/lib/errors";

import { getAuthSession } from "./authSession";
import type { AuthSession, SmartServeRole } from "./authTypes";

export function ensureAuthenticated(session: AuthSession | null): asserts session is AuthSession {
  if (!session) {
    throw unauthorized();
  }
}

export function ensureAllowed(allowed: boolean, message?: string): void {
  if (!allowed) {
    throw forbidden(message);
  }
}

export async function requireAuth(roles?: SmartServeRole[]) {
  const session = await getAuthSession();
  ensureAuthenticated(session);

  if (!roles || roles.length === 0) {
    return session;
  }

  ensureAllowed(session.memberships.some((membership) => roles.includes(membership.role)));
  return session;
}

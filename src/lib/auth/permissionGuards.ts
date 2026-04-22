import { writeAuditLog } from "@/lib/audit";
import { hasPermission, getRolePermissions, type Permission } from "@/lib/permissions";

import { ensureAllowed, requireAuth } from "./authGuards";
import { findRestaurantIdBySlug } from "./authRepository";
import { requireRestaurantAccess } from "./restaurantAccess";
import type { AuthSession } from "./authTypes";

export async function requireAnyPermission(permission: Permission) {
  const session = await requireAuth();
  const allowedMembership = session.memberships.find((membership) => hasPermission(membership.role, permission));

  ensureAllowed(Boolean(allowedMembership));

  return { session, membership: allowedMembership! };
}

export async function requireRestaurantPermissionBySlug(slug: string, permission: Permission) {
  const restaurant = await findRestaurantIdBySlug(slug);
  ensureAllowed(Boolean(restaurant), "Ресторан не знайдено");

  return requirePermission(restaurant!.id, permission);
}
export async function requirePermission(restaurantId: number, permission: Permission, existingSession?: AuthSession) {
  const { session, membership } = await requireRestaurantAccess(restaurantId, undefined, existingSession);

  if (!hasPermission(membership.role, permission)) {
    await writeAuditLog({
      action: "ACCESS_DENIED",
      userId: session.userId,
      restaurantId,
      entityType: "permission",
      entityId: permission,
      details: { role: membership.role, permissions: getRolePermissions(membership.role) },
    });
    ensureAllowed(false);
  }

  return { session, role: membership.role };
}

import { writeAuditLog } from "@/lib/audit";
import { ensureAllowed, requireAuth } from "./authGuards";
import { findRestaurantIdBySlug } from "./authRepository";
import type { AuthSession, SmartServeRole } from "./authTypes";

export async function requireRestaurantAccess(restaurantId: number, roles?: SmartServeRole[], existingSession?: AuthSession) {
  const session = existingSession ?? (await requireAuth(roles));

  const membership = session.memberships.find((item) => item.restaurantId === restaurantId);

  if (!membership) {
    await writeAuditLog({
      action: "ACCESS_DENIED",
      userId: session.userId,
      restaurantId,
      entityType: "restaurant",
      entityId: String(restaurantId),
    });
    ensureAllowed(false, "Немає доступу до цього ресторану");
  }

  return { session, membership: membership! };
}

export async function requireRestaurantAccessBySlug(slug: string, roles?: SmartServeRole[]) {
  const restaurant = await findRestaurantIdBySlug(slug);
  ensureAllowed(Boolean(restaurant), "Ресторан не знайдено");

  await requireRestaurantAccess(restaurant!.id, roles);
}

export async function requireRestaurantAccessById(restaurantId: number, roles?: SmartServeRole[]) {
  await requireRestaurantAccess(restaurantId, roles);
}

export async function requireRole(restaurantId: number, roles: SmartServeRole[]) {
  const { membership } = await requireRestaurantAccess(restaurantId);
  ensureAllowed(roles.includes(membership.role));

  return membership.role;
}

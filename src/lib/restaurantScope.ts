import { requirePermission } from "@/lib/auth";
import type { Permission } from "@/lib/permissions";
import { requireRestaurantId } from "@/lib/restaurantContext";
import { resolveRestaurantIdScope } from "@/lib/restaurantScopeCore";

export { resolveRestaurantIdScope } from "@/lib/restaurantScopeCore";

export async function requireScopedRestaurantPermission(permission: Permission, scopedRestaurantId?: number) {
  const activeRestaurantId = scopedRestaurantId ? scopedRestaurantId : await requireRestaurantId();
  const restaurantId = resolveRestaurantIdScope(scopedRestaurantId, activeRestaurantId);
  await requirePermission(restaurantId, permission);
  return restaurantId;
}

export async function requireScopedRestaurantAuthorization(permission: Permission, scopedRestaurantId?: number) {
  const activeRestaurantId = scopedRestaurantId ? scopedRestaurantId : await requireRestaurantId();
  const restaurantId = resolveRestaurantIdScope(scopedRestaurantId, activeRestaurantId);
  const authorization = await requirePermission(restaurantId, permission);

  return { restaurantId, ...authorization };
}

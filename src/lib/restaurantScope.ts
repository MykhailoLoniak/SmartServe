import type { Permission } from "@/lib/permissions";
import { requireRestaurantPermissionScope } from "@/lib/restaurantContext";

export { resolveRestaurantIdScope } from "@/lib/restaurantScopeCore";

export async function requireScopedRestaurantPermission(permission: Permission, scopedRestaurantId?: number) {
  const { restaurantId } = await requireRestaurantPermissionScope(permission, { scopedRestaurantId });
  return restaurantId;
}

export async function requireScopedRestaurantAuthorization(permission: Permission, scopedRestaurantId?: number) {
  return requireRestaurantPermissionScope(permission, { scopedRestaurantId });
}

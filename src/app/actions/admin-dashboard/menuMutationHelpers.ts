import type { DashboardMenuItem } from "./types";
import {
  createMenuItemRecord,
  deleteMenuItemRecord,
  updateMenuItemAvailabilityRecord,
  updateMenuItemRecord,
} from "./menuRepository";
import { revalidateAdminPaths } from "./shared";
import { ensureCategoryExists, ensureMenuItemExists, getMenuItemsSnapshot, withRestaurantMenuAccess } from "./menuActionHelpers";

type MenuPayload = {
  name: string;
  description: string | null;
  price: number;
  categoryId: number;
  estimatedTime: number;
  requiresKitchen: boolean;
};

export const refreshMenuSnapshot = async (scopedRestaurantId?: number): Promise<DashboardMenuItem[]> => {
  revalidateAdminPaths();
  return getMenuItemsSnapshot(scopedRestaurantId);
};

const runMenuMutation = async (
  scopedRestaurantId: number | undefined,
  mutation: (restaurantId: number) => Promise<void>,
): Promise<DashboardMenuItem[]> =>
  withRestaurantMenuAccess(scopedRestaurantId, async (restaurantId) => {
    await mutation(restaurantId);
    return refreshMenuSnapshot(scopedRestaurantId);
  });

export const createMenuItemMutation = (payload: MenuPayload, scopedRestaurantId?: number) =>
  runMenuMutation(scopedRestaurantId, async (restaurantId) => {
    await ensureCategoryExists(payload.categoryId, restaurantId);
    await createMenuItemRecord(payload);
  });

export const updateMenuItemMutation = (menuItemId: number, payload: MenuPayload, scopedRestaurantId?: number) =>
  runMenuMutation(scopedRestaurantId, async (restaurantId) => {
    await Promise.all([ensureMenuItemExists(menuItemId, restaurantId), ensureCategoryExists(payload.categoryId, restaurantId)]);
    await updateMenuItemRecord(menuItemId, payload);
  });

export const deleteMenuItemMutation = (menuItemId: number, scopedRestaurantId?: number) =>
  runMenuMutation(scopedRestaurantId, async (restaurantId) => {
    await ensureMenuItemExists(menuItemId, restaurantId);
    await deleteMenuItemRecord(menuItemId);
  });

export const toggleMenuItemAvailabilityMutation = (menuItemId: number, isAvailable: boolean, scopedRestaurantId?: number) =>
  runMenuMutation(scopedRestaurantId, async (restaurantId) => {
    await ensureMenuItemExists(menuItemId, restaurantId);
    await updateMenuItemAvailabilityRecord(menuItemId, isAvailable);
  });

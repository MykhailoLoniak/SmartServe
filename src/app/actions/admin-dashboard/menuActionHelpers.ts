import { notFound } from "@/lib/errors";
import { requireScopedRestaurantPermission } from "@/lib/restaurantScope";

import type { DashboardMenuItem } from "./types";
import { findCategoryInRestaurant, findMenuItemInRestaurant, findMenuItemsForRestaurant } from "./menuRepository";

const mapMenuItemToDashboardItem = (item: Awaited<ReturnType<typeof findMenuItemsForRestaurant>>[number]): DashboardMenuItem => ({
  id: item.id,
  name: item.name,
  description: item.description,
  price: Number(item.price),
  estimatedTime: item.estimatedTime,
  isAvailable: item.isAvailable,
  categoryId: item.categoryId,
  categoryName: item.category.name,
});

export const withRestaurantMenuAccess = async <T>(
  scopedRestaurantId: number | undefined,
  action: (restaurantId: number) => Promise<T>,
): Promise<T> => {
  const restaurantId = await requireScopedRestaurantPermission("manage_menu", scopedRestaurantId);
  return action(restaurantId);
};

export const ensureCategoryExists = async (categoryId: number, restaurantId: number) => {
  const category = await findCategoryInRestaurant(categoryId, restaurantId);

  if (!category) {
    throw notFound("Категорія не знайдена для обраного закладу.");
  }
};

export const ensureMenuItemExists = async (menuItemId: number, restaurantId: number) => {
  const menuItem = await findMenuItemInRestaurant(menuItemId, restaurantId);

  if (!menuItem) {
    throw notFound("Страва не знайдена для обраного закладу.");
  }
};

export const getMenuItemsSnapshot = (scopedRestaurantId?: number): Promise<DashboardMenuItem[]> =>
  withRestaurantMenuAccess(scopedRestaurantId, async (restaurantId) => {
    const items = await findMenuItemsForRestaurant(restaurantId);
    return items.map(mapMenuItemToDashboardItem);
  });

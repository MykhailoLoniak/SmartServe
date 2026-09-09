import { conflict, notFound } from "@/lib/errors";
import { requireScopedRestaurantPermission } from "@/lib/restaurantScope";

import {
  countMenuItemsForCategory,
  ensureDefaultCategory,
  findCategoriesForRestaurant,
  findCategoryByIdInRestaurant,
  findCategoryByNameInRestaurant,
} from "./categoryRepository";
import type { DashboardCategory } from "./types";

export const withRestaurantCategoryAccess = async <T>(
  scopedRestaurantId: number | undefined,
  action: (restaurantId: number) => Promise<T>,
): Promise<T> => {
  const restaurantId = await requireScopedRestaurantPermission("manage_menu", scopedRestaurantId);
  return action(restaurantId);
};

export const mapCategoryToDashboardCategory = (
  category: Awaited<ReturnType<typeof findCategoriesForRestaurant>>[number],
): DashboardCategory => ({
  id: category.id,
  name: category.name,
});

export const getCategoriesSnapshotInternal = async (restaurantId: number): Promise<DashboardCategory[]> => {
  await ensureDefaultCategory(restaurantId);
  const categories = await findCategoriesForRestaurant(restaurantId);
  return categories.map(mapCategoryToDashboardCategory);
};

export const ensureCategoryExistsForRestaurant = async (categoryId: number, restaurantId: number) => {
  const category = await findCategoryByIdInRestaurant(categoryId, restaurantId);

  if (!category) {
    throw notFound("Category not found for the selected restaurant.");
  }

  return category;
};

export const ensureCategoryNameIsUnique = async (name: string, restaurantId: number, ignoreCategoryId?: number) => {
  const existing = await findCategoryByNameInRestaurant(name, restaurantId);

  if (existing && existing.id !== ignoreCategoryId) {
    throw conflict("A category with this name already exists.");
  }
};

export const ensureCategoryCanBeDeleted = async (categoryId: number) => {
  const itemsCount = await countMenuItemsForCategory(categoryId);
  if (itemsCount > 0) {
    throw conflict("A category cannot be deleted while it contains menu items.");
  }
};

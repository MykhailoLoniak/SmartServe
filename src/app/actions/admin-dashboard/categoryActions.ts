"use server";

import { createCategoryRecord, deleteCategoryRecord, updateCategoryRecord } from "./categoryRepository";
import {
  ensureCategoryCanBeDeleted,
  ensureCategoryExistsForRestaurant,
  ensureCategoryNameIsUnique,
  getCategoriesSnapshotInternal,
  withRestaurantCategoryAccess,
} from "./categoryActionHelpers";
import { parseCategoryId, parseCreateCategoryPayload, parseUpdateCategoryPayload } from "./categoryValidationHelpers";
import type { DashboardCategory } from "./types";

export async function getCategoriesSnapshot(scopedRestaurantId?: number): Promise<DashboardCategory[]> {
  return withRestaurantCategoryAccess(scopedRestaurantId, async (restaurantId) => getCategoriesSnapshotInternal(restaurantId));
}

export async function createCategory(formData: FormData, scopedRestaurantId?: number): Promise<DashboardCategory[]> {
  const payload = parseCreateCategoryPayload(formData);

  return withRestaurantCategoryAccess(scopedRestaurantId, async (restaurantId) => {
    await ensureCategoryNameIsUnique(payload.name, restaurantId);
    await createCategoryRecord(payload.name, restaurantId);
    return getCategoriesSnapshotInternal(restaurantId);
  });
}

export async function updateCategory(formData: FormData, scopedRestaurantId?: number): Promise<DashboardCategory[]> {
  const { id, payload } = parseUpdateCategoryPayload(formData);

  return withRestaurantCategoryAccess(scopedRestaurantId, async (restaurantId) => {
    await ensureCategoryExistsForRestaurant(id, restaurantId);
    await ensureCategoryNameIsUnique(payload.name, restaurantId, id);
    await updateCategoryRecord(id, payload.name);
    return getCategoriesSnapshotInternal(restaurantId);
  });
}

export async function deleteCategory(formData: FormData, scopedRestaurantId?: number): Promise<DashboardCategory[]> {
  const id = parseCategoryId(formData);

  return withRestaurantCategoryAccess(scopedRestaurantId, async (restaurantId) => {
    const category = await ensureCategoryExistsForRestaurant(id, restaurantId);
    await ensureCategoryCanBeDeleted(category.id);
    await deleteCategoryRecord(category.id);
    return getCategoriesSnapshotInternal(restaurantId);
  });
}

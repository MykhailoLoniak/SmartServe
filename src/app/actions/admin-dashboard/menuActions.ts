"use server";

import type { DashboardMenuItem } from "./types";
import { getMenuItemsSnapshot as getMenuItemsSnapshotHelper } from "./menuActionHelpers";
import {
  createMenuItemMutation,
  deleteMenuItemMutation,
  toggleMenuItemAvailabilityMutation,
  updateMenuItemMutation,
} from "./menuMutationHelpers";
import {
  parseAvailabilityTogglePayload,
  parseCreateMenuItemPayload,
  parseMenuItemId,
  parseUpdateMenuItemPayload,
} from "./menuValidationHelpers";

export async function createMenuItem(formData: FormData, scopedRestaurantId?: number): Promise<DashboardMenuItem[]> {
  const payload = parseCreateMenuItemPayload(formData);
  return createMenuItemMutation(payload, scopedRestaurantId);
}

export async function updateMenuItem(formData: FormData, scopedRestaurantId?: number): Promise<DashboardMenuItem[]> {
  const { id, payload } = parseUpdateMenuItemPayload(formData);
  return updateMenuItemMutation(id, payload, scopedRestaurantId);
}

export async function deleteMenuItem(formData: FormData, scopedRestaurantId?: number): Promise<DashboardMenuItem[]> {
  const id = parseMenuItemId(formData);
  return deleteMenuItemMutation(id, scopedRestaurantId);
}

export async function toggleMenuItemAvailability(formData: FormData, scopedRestaurantId?: number): Promise<DashboardMenuItem[]> {
  const { id, isAvailable } = parseAvailabilityTogglePayload(formData);
  return toggleMenuItemAvailabilityMutation(id, isAvailable, scopedRestaurantId);
}

export async function getMenuItemsSnapshot(scopedRestaurantId?: number) {
  return getMenuItemsSnapshotHelper(scopedRestaurantId);
}
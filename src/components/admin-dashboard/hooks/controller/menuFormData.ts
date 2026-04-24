import type { DashboardMenuItem } from "@/app/actions/adminDashboardActions";

import type { MenuItemFormInput } from "../../schemas/menuItemFormSchema";
import { buildFormData } from "./formData";

export const buildUpsertMenuItemFormData = (data: MenuItemFormInput, id?: string) => {
  return buildFormData([
    ["id", id],
    ["name", data.name],
    ["description", data.description],
    ["price", data.price],
    ["categoryId", data.categoryId],
    ["estimatedTime", data.estimatedTime],
    ["requiresKitchen", data.requiresKitchen],
  ]);
};

export const buildToggleAvailabilityFormData = (item: DashboardMenuItem) => {
  return buildFormData([
    ["id", item.id],
    ["isAvailable", !item.isAvailable],
  ]);
};

export const buildDeleteMenuItemFormData = (id: number) => {
  return buildFormData([["id", id]]);
};

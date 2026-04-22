import type { DashboardMenuItem } from "@/app/actions/adminDashboardActions";

export type MenuAvailabilityFilter = "all" | "available" | "blocked";

export const filterMenuItems = (
  menuItems: DashboardMenuItem[],
  categoryFilter: string,
  availabilityFilter: MenuAvailabilityFilter,
) => {
  return menuItems.filter((item) => {
    if (categoryFilter !== "all" && String(item.categoryId) !== categoryFilter) {
      return false;
    }

    if (availabilityFilter === "available") {
      return item.isAvailable;
    }

    if (availabilityFilter === "blocked") {
      return !item.isAvailable;
    }

    return true;
  });
};

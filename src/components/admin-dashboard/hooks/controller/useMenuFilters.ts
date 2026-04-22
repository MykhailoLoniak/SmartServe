import { useMemo, useState } from "react";

import type { DashboardMenuItem } from "@/app/actions/adminDashboardActions";

import { filterMenuItems, type MenuAvailabilityFilter } from "./menuFilterHelpers";

export const useMenuFilters = (menuItems: DashboardMenuItem[]) => {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<MenuAvailabilityFilter>("all");

  const filteredMenuItems = useMemo(
    () => filterMenuItems(menuItems, categoryFilter, availabilityFilter),
    [availabilityFilter, categoryFilter, menuItems],
  );

  return {
    categoryFilter,
    availabilityFilter,
    filteredMenuItems,
    setCategoryFilter,
    setAvailabilityFilter,
  };
};

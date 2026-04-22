import { useEffect, useState } from "react";

import type { DashboardMenuItem } from "@/app/actions/adminDashboardActions";
import type { PublicError } from "@/lib/errors";

import type { DashboardCategory } from "../../types";
import { useMenuFilters } from "./useMenuFilters";
import { useMenuForm } from "./useMenuForm";
import { useMenuMutations } from "./useMenuMutations";
import { useMenuValidation } from "./useMenuValidation";

type UseMenuManagementParams = {
  categories: DashboardCategory[];
  initialMenuItems: DashboardMenuItem[];
  restaurantId?: number;
  setErrorMessage: (error: PublicError | null) => void;
  onEnterMenuTab: () => void;
  runTransition: (task: () => Promise<void>) => void;
};

export const useMenuManagement = ({
  categories,
  initialMenuItems,
  restaurantId,
  setErrorMessage,
  onEnterMenuTab,
  runTransition,
}: UseMenuManagementParams) => {
  const [menuItems, setMenuItems] = useState(initialMenuItems);

  useEffect(() => setMenuItems(initialMenuItems), [initialMenuItems]);

  const { formState, setFormState, resetForm, setEditMode } = useMenuForm({ categories, setErrorMessage, onEnterMenuTab });
  const { validateMenuForm } = useMenuValidation(setErrorMessage);
  const { categoryFilter, availabilityFilter, filteredMenuItems, setCategoryFilter, setAvailabilityFilter } = useMenuFilters(menuItems);
  const { onSubmitMenuForm, onToggleAvailability, onDeleteMenuItem } = useMenuMutations({
    restaurantId,
    setErrorMessage,
    runTransition,
    setMenuItems,
    resetForm,
    validateMenuForm,
  });

  return {
    formState,
    categoryFilter,
    availabilityFilter,
    filteredMenuItems,
    setFormState,
    setCategoryFilter,
    setAvailabilityFilter,
    setEditMode,
    resetForm,
    onSubmitMenuForm: () => onSubmitMenuForm(formState),
    onToggleAvailability,
    onDeleteMenuItem,
  };
};

import {
  createMenuItem,
  deleteMenuItem,
  toggleMenuItemAvailability,
  updateMenuItem,
  type DashboardMenuItem,
} from "@/app/actions/adminDashboardActions";
import type { PublicError } from "@/lib/errors";

import type { MenuFormState } from "../../types";
import { buildDeleteMenuItemFormData, buildToggleAvailabilityFormData, buildUpsertMenuItemFormData } from "./menuFormData";
import { runMenuMutation } from "./menuMutationHelpers";

type UseMenuMutationsParams = {
  restaurantId?: number;
  setErrorMessage: (error: PublicError | null) => void;
  runTransition: (task: () => Promise<void>) => void;
  setMenuItems: (items: DashboardMenuItem[]) => void;
  resetForm: () => void;
  validateMenuForm: (formState: MenuFormState) => {
    name: string;
    description: string;
    price: number;
    categoryId: number;
    estimatedTime: number;
    requiresKitchen: boolean;
  } | null;
};

export const useMenuMutations = ({
  restaurantId,
  setErrorMessage,
  runTransition,
  setMenuItems,
  resetForm,
  validateMenuForm,
}: UseMenuMutationsParams) => {
  const onSubmitMenuForm = (formState: MenuFormState) => {
    setErrorMessage(null);

    const validatedData = validateMenuForm(formState);
    if (!validatedData) {
      return;
    }

    runMenuMutation(runTransition, setErrorMessage, "Could not save the menu item.", async () => {
      const nextMenuItems = formState.id
        ? await updateMenuItem(buildUpsertMenuItemFormData(validatedData, formState.id), restaurantId)
        : await createMenuItem(buildUpsertMenuItemFormData(validatedData), restaurantId);

      setMenuItems(nextMenuItems);
      resetForm();
    });
  };

  const onToggleAvailability = (item: DashboardMenuItem) => {
    runMenuMutation(runTransition, setErrorMessage, "Could not update availability.", async () => {
      setMenuItems(await toggleMenuItemAvailability(buildToggleAvailabilityFormData(item), restaurantId));
    });
  };

  const onDeleteMenuItem = (id: number) => {
    runMenuMutation(runTransition, setErrorMessage, "Could not delete the menu item.", async () => {
      setMenuItems(await deleteMenuItem(buildDeleteMenuItemFormData(id), restaurantId));
    });
  };

  return {
    onSubmitMenuForm,
    onToggleAvailability,
    onDeleteMenuItem,
  };
};

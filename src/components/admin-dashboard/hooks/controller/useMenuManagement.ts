import { useEffect, useMemo, useState } from "react";

import {
  createMenuItem,
  deleteMenuItem,
  toggleMenuItemAvailability,
  type DashboardMenuItem,
  updateMenuItem,
} from "@/app/actions/adminDashboardActions";
import { toPublicError, type PublicError } from "@/lib/errors";

import { menuItemFormSchema } from "../../schemas/menuItemFormSchema";
import type { DashboardCategory } from "../../types";
import { createEmptyMenuForm } from "../../utils";
import { buildFormData } from "./formData";

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
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<"all" | "available" | "blocked">("all");
  const [formState, setFormState] = useState(() => createEmptyMenuForm(categories[0]?.id));

  useEffect(() => setMenuItems(initialMenuItems), [initialMenuItems]);

  const filteredMenuItems = useMemo(() => {
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
  }, [availabilityFilter, categoryFilter, menuItems]);

  const resetForm = () => {
    setFormState(createEmptyMenuForm(categories[0]?.id));
    setErrorMessage(null);
  };

  const setEditMode = (item: DashboardMenuItem) => {
    setFormState({
      id: String(item.id),
      name: item.name,
      description: item.description ?? "",
      price: String(item.price),
      categoryId: String(item.categoryId),
      estimatedTime: String(item.estimatedTime),
    });
    setErrorMessage(null);
    onEnterMenuTab();
  };

  const onSubmitMenuForm = () => {
    setErrorMessage(null);

    const validationResult = menuItemFormSchema.safeParse(formState);
    if (!validationResult.success) {
      setErrorMessage({
        type: "validation",
        message: validationResult.error.issues[0]?.message ?? "Форма містить помилки.",
      });
      return;
    }

    runTransition(async () => {
      try {
        const nextMenuItems = formState.id
          ? await updateMenuItem(
              buildFormData([
                ["id", formState.id],
                ["name", validationResult.data.name],
                ["description", validationResult.data.description],
                ["price", validationResult.data.price],
                ["categoryId", validationResult.data.categoryId],
                ["estimatedTime", validationResult.data.estimatedTime],
              ]),
              restaurantId,
            )
          : await createMenuItem(
              buildFormData([
                ["name", validationResult.data.name],
                ["description", validationResult.data.description],
                ["price", validationResult.data.price],
                ["categoryId", validationResult.data.categoryId],
                ["estimatedTime", validationResult.data.estimatedTime],
              ]),
              restaurantId,
            );

        setMenuItems(nextMenuItems);
        resetForm();
      } catch (error) {
        setErrorMessage(toPublicError(error, "Помилка збереження страви."));
      }
    });
  };

  const onToggleAvailability = (item: DashboardMenuItem) => {
    runTransition(async () => {
      try {
        setMenuItems(
          await toggleMenuItemAvailability(
            buildFormData([
              ["id", item.id],
              ["isAvailable", !item.isAvailable],
            ]),
            restaurantId,
          ),
        );
      } catch (error) {
        setErrorMessage(toPublicError(error, "Не вдалося змінити стоп-лист."));
      }
    });
  };

  const onDeleteMenuItem = (id: number) => {
    runTransition(async () => {
      try {
        setMenuItems(await deleteMenuItem(buildFormData([["id", id]]), restaurantId));
      } catch (error) {
        setErrorMessage(toPublicError(error, "Не вдалося видалити страву."));
      }
    });
  };

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
    onSubmitMenuForm,
    onToggleAvailability,
    onDeleteMenuItem,
  };
};

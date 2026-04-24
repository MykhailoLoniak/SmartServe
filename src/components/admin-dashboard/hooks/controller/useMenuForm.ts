import { useEffect, useState } from "react";

import type { DashboardMenuItem } from "@/app/actions/adminDashboardActions";
import type { PublicError } from "@/lib/errors";

import type { DashboardCategory } from "../../types";
import { createEmptyMenuForm } from "../../utils";

type UseMenuFormParams = {
  categories: DashboardCategory[];
  setErrorMessage: (error: PublicError | null) => void;
  onEnterMenuTab: () => void;
};

export const useMenuForm = ({ categories, setErrorMessage, onEnterMenuTab }: UseMenuFormParams) => {
  const [formState, setFormState] = useState(() => createEmptyMenuForm(categories[0]?.id));

  useEffect(() => {
    const firstCategoryId = categories[0]?.id;
    if (!firstCategoryId) {
      return;
    }

    setFormState((previous) => {
      const hasCurrentCategory = categories.some((category) => String(category.id) === previous.categoryId);
      if (hasCurrentCategory) {
        return previous;
      }

      return { ...previous, categoryId: String(firstCategoryId) };
    });
  }, [categories]);

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

  return {
    formState,
    setFormState,
    resetForm,
    setEditMode,
  };
};

import { useEffect, useState } from "react";

import {
  createCategory,
  deleteCategory,
  updateCategory,
  type DashboardCategory,
} from "@/app/actions/adminDashboardActions";
import type { PublicError } from "@/lib/errors";

import { categoryFormSchema } from "../../schemas/categoryFormSchema";
import { buildCreateCategoryFormData, buildDeleteCategoryFormData, buildUpdateCategoryFormData } from "./categoryFormData";
import { runMenuMutation } from "./menuMutationHelpers";

type UseCategoryManagementParams = {
  initialCategories: DashboardCategory[];
  restaurantId?: number;
  setErrorMessage: (error: PublicError | null) => void;
  runTransition: (task: () => Promise<void>) => void;
  onCategoryCreated: (createdCategoryName: string, nextCategories: DashboardCategory[]) => void;
  updateMenuItemsAfterRename: (categoryId: number, categoryName: string) => void;
};

export const useCategoryManagement = ({
  initialCategories,
  restaurantId,
  setErrorMessage,
  runTransition,
  onCategoryCreated,
  updateMenuItemsAfterRename,
}: UseCategoryManagementParams) => {
  const [categories, setCategories] = useState<DashboardCategory[]>(initialCategories);

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const onCreateCategory = (rawName: string) => {
    const parsed = categoryFormSchema.pick({ name: true }).safeParse({ name: rawName });
    if (!parsed.success) {
      setErrorMessage({ type: "BAD_REQUEST", status: 400, message: parsed.error.issues[0]?.message ?? "Invalid category name." });
      return;
    }

    runMenuMutation(runTransition, setErrorMessage, "Could not create the category.", async () => {
      const nextCategories = await createCategory(buildCreateCategoryFormData(parsed.data.name), restaurantId);
      setCategories(nextCategories);
      onCategoryCreated(parsed.data.name, nextCategories);
    });
  };

  const onRenameCategory = (categoryId: number, rawName: string) => {
    const parsed = categoryFormSchema.safeParse({ id: categoryId, name: rawName });
    if (!parsed.success) {
      setErrorMessage({ type: "BAD_REQUEST", status: 400, message: parsed.error.issues[0]?.message ?? "Invalid category name." });
      return;
    }

    runMenuMutation(runTransition, setErrorMessage, "Could not rename the category.", async () => {
      const nextCategories = await updateCategory(buildUpdateCategoryFormData(parsed.data), restaurantId);
      setCategories(nextCategories);
      updateMenuItemsAfterRename(parsed.data.id!, parsed.data.name);
    });
  };

  const onDeleteCategory = (categoryId: number) => {
    runMenuMutation(runTransition, setErrorMessage, "Could not delete the category.", async () => {
      const nextCategories = await deleteCategory(buildDeleteCategoryFormData(categoryId), restaurantId);
      setCategories(nextCategories);
    });
  };

  return {
    categories,
    onCreateCategory,
    onRenameCategory,
    onDeleteCategory,
    setCategories,
  };
};

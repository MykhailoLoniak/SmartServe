import type { CategoryFormInput } from "../../schemas/categoryFormSchema";
import { buildFormData } from "./formData";

export const buildCreateCategoryFormData = (name: string) => buildFormData([["name", name]]);

export const buildUpdateCategoryFormData = (data: CategoryFormInput) =>
  buildFormData([
    ["id", data.id],
    ["name", data.name],
  ]);

export const buildDeleteCategoryFormData = (id: number) => buildFormData([["id", id]]);

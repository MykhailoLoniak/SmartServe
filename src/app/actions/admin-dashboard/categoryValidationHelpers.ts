import { badRequest } from "@/lib/errors";
import { categorySchema, idSchema } from "@/lib/validation";

import { parseIntField } from "./shared";

const getCategoryName = (formData: FormData) => {
  const nameEntry = formData.get("name");
  return typeof nameEntry === "string" ? nameEntry.trim() : "";
};

export const parseCreateCategoryPayload = (formData: FormData) => {
  const payload = { name: getCategoryName(formData) };

  const result = categorySchema.pick({ name: true }).safeParse(payload);

  if (!result.success) {
    throw badRequest(result.error.issues[0]?.message ?? "Некоректні дані категорії.");
  }

  return result.data;
};

export const parseUpdateCategoryPayload = (formData: FormData) => {
  const id = parseIntField(formData.get("id"));
  const parsedId = idSchema.safeParse(id);

  if (!parsedId.success) {
    throw badRequest("Некоректний ідентифікатор категорії.");
  }

  const payload = parseCreateCategoryPayload(formData);

  return {
    id: parsedId.data,
    payload,
  };
};

export const parseCategoryId = (formData: FormData) => {
  const parsed = idSchema.safeParse(parseIntField(formData.get("id")));

  if (!parsed.success) {
    throw badRequest("Некоректний ідентифікатор категорії.");
  }

  return parsed.data;
};

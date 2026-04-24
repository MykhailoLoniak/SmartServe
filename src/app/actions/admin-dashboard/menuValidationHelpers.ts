import { badRequest } from "@/lib/errors";
import { menuItemSchema } from "@/lib/validation";

import { parseIntField, parseMenuItemPayload } from "./shared";

type ParsedMenuItemPayload = {
  name: string;
  description: string | null;
  price: number;
  categoryId: number;
  estimatedTime: number;
  requiresKitchen: boolean;
};

export const parseMenuItemId = (formData: FormData) => {
  const id = parseIntField(formData.get("id"));

  if (!id) {
    throw badRequest("Некоректний ID страви.");
  }

  return id;
};

export const parseCreateMenuItemPayload = (formData: FormData): ParsedMenuItemPayload => {
  const parsedPayload = menuItemSchema.safeParse(parseMenuItemPayload(formData));

  if (!parsedPayload.success) {
    throw badRequest("Перевірте дані страви перед збереженням.", { issues: parsedPayload.error.flatten() });
  }

  return parsedPayload.data;
};

export const parseUpdateMenuItemPayload = (formData: FormData): { id: number; payload: ParsedMenuItemPayload } => {
  const id = parseIntField(formData.get("id"));
  const parsedPayload = menuItemSchema.safeParse({ ...parseMenuItemPayload(formData), id: id ?? undefined });

  if (!parsedPayload.success || !id) {
    throw badRequest("Перевірте дані страви перед оновленням.", {
      issues: parsedPayload.success ? { id: ["invalid"] } : parsedPayload.error.flatten(),
    });
  }

  return {
    id,
    payload: parsedPayload.data,
  };
};

export const parseAvailabilityTogglePayload = (formData: FormData) => ({
  id: parseMenuItemId(formData),
  isAvailable: formData.get("isAvailable") === "true",
});

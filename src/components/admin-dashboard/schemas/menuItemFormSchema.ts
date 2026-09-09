import { z } from "zod";

export const menuItemFormSchema = z.object({
  name: z.string().trim().min(2, "Menu item name must contain at least 2 characters."),
  description: z.string().trim().max(500, "Description is too long."),
  price: z.coerce.number().positive("Price must be greater than 0."),
  categoryId: z.coerce.number().int().positive("Select a category."),
  estimatedTime: z.coerce.number().int().min(1, "Preparation time must be at least 1 minute."),
  requiresKitchen: z.boolean(),
});

export type MenuItemFormInput = z.infer<typeof menuItemFormSchema>;

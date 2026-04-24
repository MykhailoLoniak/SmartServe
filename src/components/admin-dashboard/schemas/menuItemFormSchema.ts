import { z } from "zod";

export const menuItemFormSchema = z.object({
  name: z.string().trim().min(2, "Назва страви має містити щонайменше 2 символи."),
  description: z.string().trim().max(500, "Опис занадто довгий."),
  price: z.coerce.number().positive("Ціна має бути більшою за 0."),
  categoryId: z.coerce.number().int().positive("Оберіть категорію."),
  estimatedTime: z.coerce.number().int().min(1, "Час приготування має бути від 1 хв."),
  requiresKitchen: z.boolean(),
});

export type MenuItemFormInput = z.infer<typeof menuItemFormSchema>;

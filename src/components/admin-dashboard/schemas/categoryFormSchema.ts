import { z } from "zod";

export const categoryFormSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  name: z.string().trim().min(2, "Category name must contain at least 2 characters.").max(100, "Category name is too long."),
});

export type CategoryFormInput = z.infer<typeof categoryFormSchema>;

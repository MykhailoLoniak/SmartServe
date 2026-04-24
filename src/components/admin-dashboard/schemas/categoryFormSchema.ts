import { z } from "zod";

export const categoryFormSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  name: z.string().trim().min(2, "Назва категорії має містити щонайменше 2 символи.").max(100, "Назва категорії занадто довга."),
});

export type CategoryFormInput = z.infer<typeof categoryFormSchema>;

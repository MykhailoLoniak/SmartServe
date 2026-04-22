import type { PublicError } from "@/lib/errors";

import { menuItemFormSchema } from "../../schemas/menuItemFormSchema";
import type { MenuFormState } from "../../types";

export const useMenuValidation = (setErrorMessage: (error: PublicError | null) => void) => {
  const validateMenuForm = (formState: MenuFormState) => {
    const validationResult = menuItemFormSchema.safeParse(formState);

    if (!validationResult.success) {
      setErrorMessage({
        type: "validation",
        message: validationResult.error.issues[0]?.message ?? "Форма містить помилки.",
      });
      return null;
    }

    return validationResult.data;
  };

  return { validateMenuForm };
};

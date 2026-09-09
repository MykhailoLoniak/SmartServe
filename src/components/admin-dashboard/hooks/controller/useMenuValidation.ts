import type { PublicError } from "@/lib/errors";

import { menuItemFormSchema } from "../../schemas/menuItemFormSchema";
import type { MenuFormState } from "../../types";

export const useMenuValidation = (setErrorMessage: (error: PublicError | null) => void) => {
  const validateMenuForm = (formState: MenuFormState) => {
    const validationResult = menuItemFormSchema.safeParse(formState);

    if (!validationResult.success) {
      setErrorMessage({
        type: "BAD_REQUEST",
        status: 400,
        message: validationResult.error.issues[0]?.message ?? "The form contains errors.",
      });
      return null;
    }

    return validationResult.data;
  };

  return { validateMenuForm };
};

import { toPublicError, type PublicError } from "@/lib/errors";

type RunTransition = (task: () => Promise<void>) => void;

type SetErrorMessage = (error: PublicError | null) => void;

export const runMenuMutation = (
  runTransition: RunTransition,
  setErrorMessage: SetErrorMessage,
  fallbackMessage: string,
  mutation: () => Promise<void>,
) => {
  runTransition(async () => {
    try {
      await mutation();
    } catch (error) {
      setErrorMessage(toPublicError(error, fallbackMessage));
    }
  });
};

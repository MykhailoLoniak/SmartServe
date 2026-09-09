export type AppErrorCode = "BAD_REQUEST" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "CONFLICT" | "INTERNAL_ERROR";

export type PublicError = {
  type: AppErrorCode;
  status: number;
  message: string;
  details?: Record<string, unknown>;
};

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: AppErrorCode,
    public readonly status: number,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const isAppError = (error: unknown): error is AppError => error instanceof AppError;

export const unauthorized = (message = "Authentication required") => new AppError(message, "UNAUTHORIZED", 401);
export const forbidden = (message = "Insufficient permissions") => new AppError(message, "FORBIDDEN", 403);
export const badRequest = (message = "Invalid request", details?: Record<string, unknown>) =>
  new AppError(message, "BAD_REQUEST", 400, details);
export const notFound = (message = "Not found") => new AppError(message, "NOT_FOUND", 404);
export const conflict = (message = "Data conflict", details?: Record<string, unknown>) =>
  new AppError(message, "CONFLICT", 409, details);
export const internalError = (message = "Internal server error", details?: Record<string, unknown>) =>
  new AppError(message, "INTERNAL_ERROR", 500, details);

export const toPublicError = (error: unknown, fallbackMessage = "Internal server error"): PublicError => {
  if (isAppError(error)) {
    return {
      type: error.code,
      status: error.status,
      message: error.message,
      details: error.details,
    };
  }

  return {
    type: "INTERNAL_ERROR",
    status: 500,
    message: fallbackMessage,
  };
};

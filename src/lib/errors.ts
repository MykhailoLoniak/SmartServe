export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const isAppError = (error: unknown): error is AppError => error instanceof AppError;

export const unauthorized = (message = "Authentication required") => new AppError(message, "UNAUTHORIZED", 401);
export const forbidden = (message = "Недостатньо прав") => new AppError(message, "FORBIDDEN", 403);
export const badRequest = (message = "Некоректний запит", details?: Record<string, unknown>) =>
  new AppError(message, "BAD_REQUEST", 400, details);
export const notFound = (message = "Не знайдено") => new AppError(message, "NOT_FOUND", 404);
export const conflict = (message = "Конфлікт даних", details?: Record<string, unknown>) =>
  new AppError(message, "CONFLICT", 409, details);
export const internalError = (message = "Внутрішня помилка сервера", details?: Record<string, unknown>) =>
  new AppError(message, "INTERNAL_ERROR", 500, details);

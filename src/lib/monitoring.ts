export const captureException = (error: unknown, context?: Record<string, unknown>) => {
  if (process.env.SENTRY_DSN) {
    console.error("Sentry event", { error, context });
  }
};

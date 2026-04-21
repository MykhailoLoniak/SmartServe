type MonitoringContext = Record<string, unknown>;

const hasSentryDsn = () => Boolean(process.env.SENTRY_DSN);

export const captureException = (error: unknown, context: MonitoringContext = {}) => {
  // Explicit no-op integration point until @sentry/nextjs is installed.
  // Keeps error capture paths consistent without pretending that events are shipped externally.
  if (!hasSentryDsn()) {
    console.error("monitoring.noop", { error, context });
    return;
  }

  console.error("monitoring.sentry_not_installed", { error, context });
};

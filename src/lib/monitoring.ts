type MonitoringContext = Record<string, unknown>;

export const captureException = (error: unknown, context: MonitoringContext = {}) => {
  console.error("monitoring.console", { error, context });
};

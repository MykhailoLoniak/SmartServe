import crypto from "node:crypto";

const scrub = (value: unknown): unknown => {
  if (!value || typeof value !== "object") {
    return value;
  }

  const sensitive = new Set(["password", "passwordHash", "token", "authorization", "cookie"]);
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, val]) => [key, sensitive.has(key) ? "[REDACTED]" : val]),
  );
};

export const createRequestId = () => crypto.randomUUID();

export const logEvent = (event: string, payload: Record<string, unknown>) => {
  console.info(
    JSON.stringify({
      level: "info",
      event,
      timestamp: new Date().toISOString(),
      ...scrub(payload),
    }),
  );
};

export const logError = (event: string, payload: Record<string, unknown>) => {
  console.error(
    JSON.stringify({
      level: "error",
      event,
      timestamp: new Date().toISOString(),
      ...scrub(payload),
    }),
  );
};

export const formatOrderTime = (createdAt: string) =>
  new Date(createdAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

export const getRefreshSeconds = (refreshIntervalMs: number) =>
  Math.round(refreshIntervalMs / 1000);

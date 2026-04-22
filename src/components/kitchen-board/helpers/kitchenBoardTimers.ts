export const getMidnightRefreshDelayMs = (now: Date) => {
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);

  return Math.max(1_000, nextMidnight.getTime() - now.getTime() + 1_000);
};

export const getElapsedMinutes = (createdAt: string, nowTimestamp: number) =>
  Math.max(0, Math.floor((nowTimestamp - new Date(createdAt).getTime()) / 60_000));

export const formatElapsedMinutes = (minutes: number) => `${minutes} min`;

type StatsRow = { ordersCount: number; revenue: number };

const EN_LOCALE = "en-US";

export const getWeekLabel = (completedAt: Date) => {
  const weekStart = new Date(completedAt);
  const day = weekStart.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  weekStart.setDate(weekStart.getDate() + diff);
  weekStart.setHours(0, 0, 0, 0);

  return `Week ${weekStart.toLocaleDateString(EN_LOCALE)}`;
};

export const updateStatsBucket = (bucket: Map<string, StatsRow>, label: string, amount: number) => {
  const row = bucket.get(label) ?? { ordersCount: 0, revenue: 0 };
  row.ordersCount += 1;
  row.revenue += amount;
  bucket.set(label, row);
};

export const toStatsRows = (bucket: Map<string, StatsRow>) =>
  [...bucket.entries()].map(([label, row]) => ({
    label,
    ordersCount: row.ordersCount,
    revenue: row.revenue,
    averageCheck: row.ordersCount > 0 ? row.revenue / row.ordersCount : 0,
  }));

export type DateRange = {
  start: Date;
  end: Date;
};

export const getDayRange = (baseDate = new Date()): DateRange => {
  const start = new Date(baseDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(baseDate);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

export const getYesterdayRange = (baseDate = new Date()): DateRange => {
  const yesterday = new Date(baseDate);
  yesterday.setDate(yesterday.getDate() - 1);
  return getDayRange(yesterday);
};

export const getWeekRange = (baseDate = new Date()): DateRange => {
  const current = new Date(baseDate);
  const day = current.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  const monday = new Date(current);
  monday.setDate(current.getDate() + diff);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const start = getDayRange(monday).start;
  const end = getDayRange(sunday).end;

  return { start, end };
};

export const getMonthRange = (baseDate = new Date()): DateRange => {
  const start = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

export const getPreviousMonthRange = (baseDate = new Date()): DateRange => {
  const start = new Date(baseDate.getFullYear(), baseDate.getMonth() - 1, 1);
  const end = new Date(baseDate.getFullYear(), baseDate.getMonth(), 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

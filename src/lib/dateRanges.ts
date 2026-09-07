export type DateRange = { start: Date; end: Date };

export const APP_TIME_ZONE = process.env.APP_TIME_ZONE ?? "Europe/Madrid";
type DateParts = { year: number; month: number; day: number };

const getDateParts = (date: Date, timeZone = APP_TIME_ZONE): DateParts => {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);
  return { year: value("year"), month: value("month"), day: value("day") };
};

const getOffsetMs = (date: Date, timeZone: string) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);
  return Date.UTC(value("year"), value("month") - 1, value("day"), value("hour"), value("minute"), value("second")) - date.getTime();
};

const startOfZonedDate = ({ year, month, day }: DateParts, timeZone = APP_TIME_ZONE) => {
  const wallClockUtc = Date.UTC(year, month - 1, day);
  let instant = new Date(wallClockUtc - getOffsetMs(new Date(wallClockUtc), timeZone));
  instant = new Date(wallClockUtc - getOffsetMs(instant, timeZone));
  return instant;
};

const addDays = (parts: DateParts, days: number): DateParts => {
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
};

const rangeFromParts = (startParts: DateParts, endExclusiveParts: DateParts, timeZone = APP_TIME_ZONE): DateRange => ({
  start: startOfZonedDate(startParts, timeZone),
  end: new Date(startOfZonedDate(endExclusiveParts, timeZone).getTime() - 1),
});

export const getDayRange = (baseDate = new Date(), timeZone = APP_TIME_ZONE) => {
  const parts = getDateParts(baseDate, timeZone);
  return rangeFromParts(parts, addDays(parts, 1), timeZone);
};

export const getYesterdayRange = (baseDate = new Date(), timeZone = APP_TIME_ZONE) => {
  const yesterday = addDays(getDateParts(baseDate, timeZone), -1);
  return rangeFromParts(yesterday, addDays(yesterday, 1), timeZone);
};

export const getWeekRange = (baseDate = new Date(), timeZone = APP_TIME_ZONE) => {
  const current = getDateParts(baseDate, timeZone);
  const weekday = new Date(Date.UTC(current.year, current.month - 1, current.day)).getUTCDay();
  const monday = addDays(current, weekday === 0 ? -6 : 1 - weekday);
  return rangeFromParts(monday, addDays(monday, 7), timeZone);
};

export const getMonthRange = (baseDate = new Date(), timeZone = APP_TIME_ZONE) => {
  const current = getDateParts(baseDate, timeZone);
  const nextMonth = new Date(Date.UTC(current.year, current.month, 1));
  return rangeFromParts(
    { year: current.year, month: current.month, day: 1 },
    { year: nextMonth.getUTCFullYear(), month: nextMonth.getUTCMonth() + 1, day: 1 },
    timeZone,
  );
};

export const getPreviousMonthRange = (baseDate = new Date(), timeZone = APP_TIME_ZONE) => {
  const current = getDateParts(baseDate, timeZone);
  const startDate = new Date(Date.UTC(current.year, current.month - 2, 1));
  return rangeFromParts(
    { year: startDate.getUTCFullYear(), month: startDate.getUTCMonth() + 1, day: 1 },
    { year: current.year, month: current.month, day: 1 },
    timeZone,
  );
};

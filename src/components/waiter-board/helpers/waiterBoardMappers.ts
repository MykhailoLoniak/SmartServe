import type { WaiterTableReport } from "@/app/actions/waiterReportActions";

export const WAITER_STATUS_LABELS: Record<string, string> = {
  PENDING: "В роботі",
  COOKING: "Готується",
  READY: "Готово до подачі",
  SERVED: "Подано",
};

export const getTableReadinessText = (report: WaiterTableReport) => {
  if (report.hasInProgressItems) {
    return "Є позиції в роботі";
  }

  if (report.hasReadyItems) {
    return "Усе готово до подачі";
  }

  return "Очікування";
};

export const getWaiterStatusLabel = (status: string) => WAITER_STATUS_LABELS[status] ?? status;

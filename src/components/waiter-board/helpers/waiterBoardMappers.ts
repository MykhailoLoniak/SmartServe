import type { WaiterTableReport } from "@/app/actions/waiterReportActions";

export const WAITER_STATUS_LABELS: Record<string, string> = {
  PENDING: "In progress",
  COOKING: "Cooking",
  READY: "Ready to serve",
  SERVED: "Served",
};

export const getTableReadinessText = (report: WaiterTableReport) => {
  if (report.hasInProgressItems) {
    return "Some items are still in progress";
  }

  if (report.hasReadyItems) {
    return "Everything is ready to serve";
  }

  return "Waiting";
};

export const getWaiterStatusLabel = (status: string) => WAITER_STATUS_LABELS[status] ?? status;

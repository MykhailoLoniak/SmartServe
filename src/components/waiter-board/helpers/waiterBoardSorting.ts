import type { ActiveKitchenOrder } from "@/app/actions/getActiveOrders";
import type { WaiterTableReport } from "@/app/actions/waiterReportActions";

export const sortTableReportsByNumber = (reports: WaiterTableReport[]) => [...reports].sort((a, b) => a.tableNumber - b.tableNumber);

export const sortCompletedOrdersByTimeDesc = (orders: ActiveKitchenOrder[]) =>
  [...orders].sort(
    (a, b) =>
      new Date(b.completedAt ?? b.createdAt).getTime() -
      new Date(a.completedAt ?? a.createdAt).getTime(),
  );

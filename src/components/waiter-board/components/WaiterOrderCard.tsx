import type { WaiterTableReport } from "@/app/actions/waiterReportActions";

import { formatCurrency } from "../helpers/waiterBoardFormatters";
import { getTableReadinessText } from "../helpers/waiterBoardMappers";
import { WaiterOrderItemList } from "./WaiterOrderItemList";
import { WaiterOrderTimer } from "./WaiterOrderTimer";

type WaiterOrderCardProps = {
  nowTimestamp: number;
  onCloseBill: (tableId: number) => void;
  onMarkServed: (orderItemId: number) => void;
  pendingServeItemIds: number[];
  report: WaiterTableReport;
  updatingTableIds: number[];
};

export function WaiterOrderCard({ nowTimestamp, onCloseBill, onMarkServed, pendingServeItemIds, report, updatingTableIds }: WaiterOrderCardProps) {
  const isUpdating = updatingTableIds.includes(report.tableId);

  return (
    <li className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-black">Table #{report.tableNumber}</p>
          <p className="text-sm text-black/60">Active orders: {report.orders.length}</p>
        </div>
        <p className="text-lg font-bold text-black">{formatCurrency(report.total)}</p>
      </div>

      <div className="space-y-3">
        {report.orders.map((order) => (
          <div key={order.id} className="rounded-xl border border-black/10 bg-[#f7f7f8] p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-medium text-black">Order #{order.id}</p>
              <WaiterOrderTimer createdAt={order.createdAt} nowTimestamp={nowTimestamp} />
            </div>
            <WaiterOrderItemList items={order.items} onMarkServed={onMarkServed} pendingItemIds={pendingServeItemIds} />
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-black/60">{getTableReadinessText(report)}</p>
        <button
          type="button"
          onClick={() => onCloseBill(report.tableId)}
          disabled={isUpdating || report.hasInProgressItems}
          className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Close bill
        </button>
      </div>
    </li>
  );
}

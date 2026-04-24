import type { WaiterTableReport } from "@/app/actions/waiterReportActions";

import { formatCurrency } from "../helpers/waiterBoardFormatters";
import { WaiterStatusBadge } from "./WaiterStatusBadge";

type WaiterOrderItemListProps = {
  items: WaiterTableReport["orders"][number]["items"];
  onMarkServed: (orderItemId: number) => void;
  pendingItemIds: number[];
};

export function WaiterOrderItemList({ items, onMarkServed, pendingItemIds }: WaiterOrderItemListProps) {
  return (
    <ul className="space-y-2">
      {items.map((item) => {
        const isReady = item.status === "READY";
        const isServed = item.status === "SERVED";
        const isPending = pendingItemIds.includes(item.id);
        const canMarkServed = item.requiresKitchen ? item.status === "READY" : !isServed;

        return (
          <li key={item.id} className={`rounded-lg px-3 py-2 text-sm ${isReady || isServed ? "bg-emerald-50" : "bg-white"}`}>
            <div className="flex items-center justify-between gap-3">
              <span className={isReady ? "font-medium" : ""}>
                {item.name} ×{item.quantity}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{formatCurrency(item.priceAtTime)}</span>
                {canMarkServed ? (
                  <button
                    type="button"
                    onClick={() => onMarkServed(item.id)}
                    disabled={isPending}
                    className="rounded-lg bg-black px-2 py-1 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Подано
                  </button>
                ) : null}
                {isServed ? <span className="rounded-lg bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">Подано</span> : null}
              </div>
            </div>
            <WaiterStatusBadge status={item.status} />
          </li>
        );
      })}
    </ul>
  );
}

import type { WaiterTableReport } from "@/app/actions/waiterReportActions";

import { formatCurrency } from "../helpers/waiterBoardFormatters";
import { WaiterStatusBadge } from "./WaiterStatusBadge";

type WaiterOrderItemListProps = {
  items: WaiterTableReport["orders"][number]["items"];
};

export function WaiterOrderItemList({ items }: WaiterOrderItemListProps) {
  return (
    <ul className="space-y-2">
      {items.map((item) => {
        const isReady = item.status === "READY";

        return (
          <li key={item.id} className={`rounded-lg px-3 py-2 text-sm ${isReady ? "bg-emerald-50" : "bg-white"}`}>
            <div className="flex items-center justify-between gap-3">
              <span className={isReady ? "font-medium" : ""}>
                {item.name} ×{item.quantity}
              </span>
              <span className="font-medium">{formatCurrency(item.priceAtTime)}</span>
            </div>
            <WaiterStatusBadge status={item.status} />
          </li>
        );
      })}
    </ul>
  );
}

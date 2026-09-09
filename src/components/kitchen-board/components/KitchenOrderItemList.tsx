import type { ActiveKitchenOrder } from "@/app/actions/getActiveOrders";

import { getNextItemStatus } from "../helpers/kitchenBoardMappers";
import type { OrdersTab } from "../helpers/kitchenBoardFilters";
import { sortOrderItemsByCourseAndId } from "../helpers/kitchenBoardSorting";
import { KitchenOrderTimers } from "./KitchenOrderTimers";
import { KitchenStatusBadge } from "./KitchenStatusBadge";

type KitchenOrderItemListProps = {
  activeTab: OrdersTab;
  onItemStatusChange: (orderItemId: number, status: "COOKING" | "READY") => void;
  order: ActiveKitchenOrder;
  updatingItemIds: number[];
};

export function KitchenOrderItemList({
  activeTab,
  onItemStatusChange,
  order,
  updatingItemIds,
}: KitchenOrderItemListProps) {
  const sortedItems = sortOrderItemsByCourseAndId(order.items);

  return (
    <ul className="space-y-2">
      {sortedItems.map((item) => {
        const isUpdating = updatingItemIds.includes(item.id);
        const nextStatus = getNextItemStatus(item.status);
        const isFinal = item.status === "READY";

        return (
          <li key={item.id} className={`rounded-lg bg-neutral-50 p-3 text-sm ${isFinal ? "opacity-50" : ""}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className={`font-medium ${isFinal ? "line-through" : ""}`}>{item.menuItem?.name ?? "Menu item"}</span>
                  <span className={`font-medium ${isFinal ? "line-through" : ""}`}>×{item.quantity}</span>
                  <KitchenStatusBadge course={item.course} />
                </div>
                <p className="text-xs text-neutral-500">Status: {item.status}</p>
              </div>

              <KitchenOrderTimers status={item.status} startedAt={item.startedAt} />
            </div>

            {activeTab === "active" && !isFinal ? (
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => onItemStatusChange(item.id, "COOKING")}
                  disabled={isUpdating || item.status !== "PENDING"}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Start
                </button>
                <button
                  type="button"
                  onClick={() => onItemStatusChange(item.id, "READY")}
                  disabled={isUpdating || item.status !== "COOKING" || nextStatus !== "READY"}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Ready
                </button>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

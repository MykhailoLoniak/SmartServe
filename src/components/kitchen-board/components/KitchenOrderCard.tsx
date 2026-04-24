import type { ActiveKitchenOrder } from "@/app/actions/getActiveOrders";
import { KITCHEN_STATUS_UI } from "@/lib/kitchen-config";

import type { OrdersTab } from "../helpers/kitchenBoardFilters";
import { formatOrderTime } from "../helpers/kitchenBoardFormatters";
import { getDisplayOrderTime } from "../helpers/kitchenBoardMappers";
import { KitchenOrderItemList } from "./KitchenOrderItemList";

type KitchenOrderCardProps = {
  activeTab: OrdersTab;
  onItemStatusChange: (orderItemId: number, status: "COOKING" | "READY") => void;
  order: ActiveKitchenOrder;
  updatingItemIds: number[];
};

export function KitchenOrderCard({ activeTab, onItemStatusChange, order, updatingItemIds }: KitchenOrderCardProps) {
  const statusUi = KITCHEN_STATUS_UI[order.status];

  return (
    <li className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-base font-semibold">Замовлення #{order.id}</p>
          <p className="text-sm text-neutral-500">
            {activeTab === "active" ? "Час:" : "Завершено о:"} {formatOrderTime(getDisplayOrderTime(order))}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold uppercase text-white">Стіл №{order.tableNumber}</span>
          {activeTab === "completed" ? (
            <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${statusUi.badgeClassName}`}>{statusUi.label}</span>
          ) : null}
        </div>
      </div>

      <KitchenOrderItemList
        activeTab={activeTab}
        onItemStatusChange={onItemStatusChange}
        order={order}
        updatingItemIds={updatingItemIds}
      />
    </li>
  );
}

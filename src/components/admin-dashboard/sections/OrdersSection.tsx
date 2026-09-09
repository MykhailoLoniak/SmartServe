import type { ActiveKitchenOrder } from "@/app/actions/getActiveOrders";
import type { OrderViewTab } from "../types";
import { formatTime } from "../utils";

type CookingDelayRow = {
  orderItemId: number;
  orderId: number;
  tableNumber: number;
  menuItemName: string;
  quantity: number;
  startedAt: string | null;
  elapsedMinutes: number;
  estimatedTime: number;
  critical: boolean;
};

type OrdersSectionProps = {
  orderViewTab: OrderViewTab;
  activeOrders: ActiveKitchenOrder[];
  completedOrders: ActiveKitchenOrder[];
  rowsWithDelay: CookingDelayRow[];
  onOrderViewTabChange: (tab: OrderViewTab) => void;
};

export const OrdersSection = ({
  orderViewTab,
  activeOrders,
  completedOrders,
  rowsWithDelay,
  onOrderViewTabChange,
}: OrdersSectionProps) => {
  const visibleOrders = orderViewTab === "active" ? activeOrders : completedOrders;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-black">Order workflow</h2>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => onOrderViewTabChange("active")}
            className={`rounded-xl px-4 py-2 text-sm font-medium ${orderViewTab === "active" ? "bg-black text-white" : "bg-black/5 text-black"}`}
          >
            Active
          </button>
          <button
            type="button"
            onClick={() => onOrderViewTabChange("completed")}
            className={`rounded-xl px-4 py-2 text-sm font-medium ${orderViewTab === "completed" ? "bg-black text-white" : "bg-black/5 text-black"}`}
          >
            Completed
          </button>
        </div>

        <ul className="mt-4 space-y-3">
          {visibleOrders.map((order) => (
            <li key={order.id} className="rounded-2xl border border-black/10 bg-[#f7f7f8] p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-semibold text-black">Order #{order.id}</p>
                <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold uppercase text-white">Table #{order.tableNumber}</span>
              </div>
              <ul className="space-y-1">
                {order.items.map((item) => (
                  <li key={item.id} className={`text-sm ${item.status === "READY" ? "opacity-50 line-through" : ""}`}>
                    {item.menuItem?.name ?? "Menu item"} ×{item.quantity}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        {visibleOrders.length === 0 ? <p className="mt-3 text-black/60">All orders have been served. Great work!</p> : null}
      </div>

      <div>
        <h2 className="text-xl font-semibold text-black">Kitchen delay monitor</h2>
        {rowsWithDelay.length === 0 ? (
          <p className="text-black/60">There are no items with COOKING status.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-black/10 text-left text-black/60">
                  <th className="px-3 py-2">Order</th>
                  <th className="px-3 py-2">Table</th>
                  <th className="px-3 py-2">Menu item</th>
                  <th className="px-3 py-2">Started</th>
                  <th className="px-3 py-2">Actual (min)</th>
                  <th className="px-3 py-2">Target (min)</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {rowsWithDelay.map((item) => (
                  <tr key={item.orderItemId} className={item.critical ? "bg-red-50 text-red-800" : "border-b border-black/5"}>
                    <td className="px-3 py-2 font-medium">#{item.orderId}</td>
                    <td className="px-3 py-2">#{item.tableNumber}</td>
                    <td className="px-3 py-2">{item.menuItemName} ×{item.quantity}</td>
                    <td className="px-3 py-2">{formatTime(item.startedAt)}</td>
                    <td className="px-3 py-2">{item.elapsedMinutes}</td>
                    <td className="px-3 py-2">{item.estimatedTime}</td>
                    <td className="px-3 py-2 font-semibold">{item.critical ? "Critical Delay" : "On time"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

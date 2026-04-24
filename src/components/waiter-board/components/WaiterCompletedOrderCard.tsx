import type { ActiveKitchenOrder } from "@/app/actions/getActiveOrders";

import { WaiterOrderTimer } from "./WaiterOrderTimer";

type WaiterCompletedOrderCardProps = {
  order: ActiveKitchenOrder;
  onOpenDetails: (orderId: number) => void;
};

export function WaiterCompletedOrderCard({ order, onOpenDetails }: WaiterCompletedOrderCardProps) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpenDetails(order.id)}
        className="w-full rounded-2xl border border-black/10 bg-white p-4 text-left shadow-sm transition hover:border-black/30"
      >
      <div className="flex items-center justify-between">
        <p className="font-semibold text-black">Замовлення #{order.id}</p>
        <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold uppercase text-white">Стіл №{order.tableNumber}</span>
      </div>
      <WaiterOrderTimer createdAt={order.completedAt ?? order.createdAt} prefix="Закрито о " />
      </button>
    </li>
  );
}

import type { ActiveKitchenOrder } from "@/app/actions/getActiveOrders";

import { WaiterOrderTimer } from "./WaiterOrderTimer";

type WaiterCompletedOrderCardProps = {
  order: ActiveKitchenOrder;
};

export function WaiterCompletedOrderCard({ order }: WaiterCompletedOrderCardProps) {
  return (
    <li className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-black">Замовлення #{order.id}</p>
        <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold uppercase text-white">Стіл №{order.tableNumber}</span>
      </div>
      <WaiterOrderTimer createdAt={order.completedAt ?? order.createdAt} prefix="Закрито о " />
    </li>
  );
}

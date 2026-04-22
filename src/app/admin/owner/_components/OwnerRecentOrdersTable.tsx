import { formatOrderTime } from "../_lib/ownerDashboardFormatters";

type OwnerRecentOrdersTableProps = {
  title: string;
  emptyText: string;
  timeLabel: string;
  orders: Array<{
    id: number;
    tableNumber: number;
    createdAt: string;
  }>;
};

export function OwnerRecentOrdersTable({ title, emptyText, timeLabel, orders }: OwnerRecentOrdersTableProps) {
  return (
    <article>
      <h3 className="mb-2 text-sm font-semibold uppercase text-black/60">{title}</h3>
      <ul className="space-y-2">
        {orders.map((order) => (
          <li key={order.id} className="rounded-2xl border border-black/10 bg-[#f7f7f8] p-3">
            <div className="mb-1 flex items-center justify-between">
              <p className="font-semibold">Замовлення #{order.id}</p>
              <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold uppercase text-white">Стіл №{order.tableNumber}</span>
            </div>
            <p className="text-xs text-black/60">
              {timeLabel}: {formatOrderTime(order.createdAt)}
            </p>
          </li>
        ))}
        {orders.length === 0 ? <p className="text-sm text-black/60">{emptyText}</p> : null}
      </ul>
    </article>
  );
}

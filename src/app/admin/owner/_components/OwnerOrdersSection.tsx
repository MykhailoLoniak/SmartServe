import { OwnerRecentOrdersTable } from "./OwnerRecentOrdersTable";

type OrderRow = {
  id: number;
  tableNumber: number;
  createdAt: string;
};

type OwnerOrdersSectionProps = {
  activeOrders: OrderRow[];
  completedOrders: OrderRow[];
};

export function OwnerOrdersSection({ activeOrders, completedOrders }: OwnerOrdersSectionProps) {
  return (
    <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-black">Процес замовлень</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <OwnerRecentOrdersTable
          title="Активні"
          timeLabel="Час"
          orders={activeOrders}
          emptyText="Усі замовлення видані. Чудова робота!"
        />
        <OwnerRecentOrdersTable
          title="Завершені"
          timeLabel="Фінальний час"
          orders={completedOrders}
          emptyText="Завершених замовлень ще немає."
        />
      </div>
    </section>
  );
}

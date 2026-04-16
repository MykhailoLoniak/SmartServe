"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import { getActiveOrders, type ActiveKitchenOrder } from "@/app/actions/getActiveOrders";
import { updateOrderStatus } from "@/app/actions/updateOrderStatus";
import { subscribeToKitchenOrderChanges } from "@/lib/supabase-browser";

type WaiterReadyBoardProps = {
  initialOrders: ActiveKitchenOrder[];
  refreshIntervalMs: number;
};

type OrdersTab = "active" | "completed";

const formatOrderTime = (createdAt: string) =>
  new Date(createdAt).toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
  });

export default function WaiterReadyBoard({ initialOrders, refreshIntervalMs }: WaiterReadyBoardProps) {
  const [activeOrders, setActiveOrders] = useState<ActiveKitchenOrder[]>(initialOrders);
  const [completedOrders, setCompletedOrders] = useState<ActiveKitchenOrder[]>([]);
  const [activeTab, setActiveTab] = useState<OrdersTab>("active");
  const [updatingOrderIds, setUpdatingOrderIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setActiveOrders(initialOrders);
  }, [initialOrders]);

  useEffect(() => {
    let isMounted = true;

    const refreshOrders = async () => {
      try {
        const [activeData, completedData] = await Promise.all([
          getActiveOrders({ statuses: ["READY"], mode: "active" }),
          getActiveOrders({ statuses: ["PAID"], mode: "completed" }),
        ]);
        if (isMounted) {
          setActiveOrders(activeData);
          setCompletedOrders(completedData);
        }
      } catch (error) {
        console.error("Failed to refresh ready orders", error);
      }
    };

    setIsLoading(true);

    const subscription = subscribeToKitchenOrderChanges({
      onChange: () => {
        void refreshOrders();
      },
    });

    const intervalId = window.setInterval(() => {
      void refreshOrders();
    }, refreshIntervalMs);

    void refreshOrders().finally(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      subscription?.unsubscribe();
    };
  }, [refreshIntervalMs]);

  const onCompleteOrder = (orderId: number) => {
    setUpdatingOrderIds((previous) => [...previous, orderId]);

    startTransition(async () => {
      try {
        await updateOrderStatus({ orderId, status: "PAID" });
      } catch (error) {
        console.error("Failed to mark order as completed", error);
      } finally {
        setUpdatingOrderIds((previous) => previous.filter((id) => id !== orderId));
      }
    });
  };

  const orders = activeTab === "active" ? activeOrders : completedOrders;
  const ordersCount = useMemo(() => orders.length, [orders.length]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl p-6 md:p-10">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-black">Офіціант · Замовлення</h1>
          <p className="mt-1 text-sm text-black/60">
            Оновлення списку відбувається кожні {Math.round(refreshIntervalMs / 1000)} секунд.
          </p>
        </div>
        <span className="rounded-full bg-black/5 px-3 py-1 text-sm font-medium text-black">{ordersCount}</span>
      </header>

      <div className="mb-5 flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("active")}
          className={`rounded-xl px-4 py-2 text-sm font-medium ${
            activeTab === "active" ? "bg-black text-white" : "bg-black/5 text-black"
          }`}
        >
          Активні
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("completed")}
          className={`rounded-xl px-4 py-2 text-sm font-medium ${
            activeTab === "completed" ? "bg-black text-white" : "bg-black/5 text-black"
          }`}
        >
          Завершені
        </button>
      </div>

      {isLoading ? <p className="text-black/60">Завантажуємо замовлення…</p> : null}

      {!isLoading && orders.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-black/20 bg-white p-5 text-black/60">
          Усі замовлення видані. Чудова робота!
        </p>
      ) : null}

      <ul className="space-y-4">
        {orders.map((order) => {
          const isUpdating = updatingOrderIds.includes(order.id);

          return (
            <li key={order.id} className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <p className="text-base font-semibold text-black">Замовлення #{order.id}</p>
                  <p className="text-sm text-black/60">
                    {activeTab === "active" ? "Час:" : "Фінальний час:"} {formatOrderTime(order.createdAt)}
                  </p>
                </div>
                <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold uppercase text-white">
                  Стіл №{order.tableNumber}
                </span>
              </div>

              <ul className="space-y-2">
                {order.items.map((item, index) => (
                  <li
                    key={`${order.id}-${item.menuItem?.name ?? "item"}-${index}`}
                    className="flex items-center justify-between rounded-lg bg-black/5 px-3 py-2 text-sm"
                  >
                    <span className="line-through opacity-50">{item.menuItem?.name ?? "Страва"}</span>
                    <span className="font-medium line-through opacity-50">×{item.quantity}</span>
                  </li>
                ))}
              </ul>

              {activeTab === "active" ? (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => onCompleteOrder(order.id)}
                    disabled={isUpdating}
                    className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Подано
                  </button>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </main>
  );
}

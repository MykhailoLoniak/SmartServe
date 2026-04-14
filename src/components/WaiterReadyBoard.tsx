"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import { getActiveOrders, type ActiveKitchenOrder } from "@/app/actions/getActiveOrders";
import { updateOrderStatus } from "@/app/actions/updateOrderStatus";
import { subscribeToKitchenOrderChanges } from "@/lib/supabase-browser";

type WaiterReadyBoardProps = {
  initialOrders: ActiveKitchenOrder[];
  refreshIntervalMs: number;
};

const formatOrderTime = (createdAt: string) =>
  new Date(createdAt).toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
  });

export default function WaiterReadyBoard({ initialOrders, refreshIntervalMs }: WaiterReadyBoardProps) {
  const [orders, setOrders] = useState<ActiveKitchenOrder[]>(initialOrders);
  const [updatingOrderIds, setUpdatingOrderIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  useEffect(() => {
    let isMounted = true;

    const refreshOrders = async () => {
      try {
        const data = await getActiveOrders({ statuses: ["READY"] });
        if (isMounted) {
          setOrders(data);
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
        // In the current schema final status is PAID (used here as COMPLETED/served state).
        await updateOrderStatus({ orderId, status: "PAID" });
        setOrders((previous) => previous.filter((order) => order.id !== orderId));
      } catch (error) {
        console.error("Failed to mark order as completed", error);
      } finally {
        setUpdatingOrderIds((previous) => previous.filter((id) => id !== orderId));
      }
    });
  };

  const readyOrdersCount = useMemo(() => orders.length, [orders.length]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl p-6 md:p-10">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-black">Офіціант · Страви до подачі</h1>
          <p className="mt-1 text-sm text-black/60">
            Оновлення списку відбувається кожні {Math.round(refreshIntervalMs / 1000)} секунд.
          </p>
        </div>
        <span className="rounded-full bg-black/5 px-3 py-1 text-sm font-medium text-black">
          Готових: {readyOrdersCount}
        </span>
      </header>

      {isLoading ? <p className="text-black/60">Завантажуємо замовлення…</p> : null}

      {!isLoading && orders.length === 0 ? (
        <p className="rounded-xl border border-dashed border-black/20 bg-white p-5 text-black/60">
          Наразі немає готових замовлень до подачі.
        </p>
      ) : null}

      <ul className="space-y-4">
        {orders.map((order) => {
          const isUpdating = updatingOrderIds.includes(order.id);

          return (
            <li key={order.id} className="rounded-xl border border-black/10 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <p className="text-base font-semibold text-black">Замовлення #{order.id}</p>
                  <p className="text-sm text-black/60">Час: {formatOrderTime(order.createdAt)}</p>
                </div>
                <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  Ready
                </span>
              </div>

              <ul className="space-y-2">
                {order.items.map((item, index) => (
                  <li
                    key={`${order.id}-${item.menuItem?.name ?? "item"}-${index}`}
                    className="flex items-center justify-between rounded-lg bg-black/5 px-3 py-2 text-sm"
                  >
                    <span>{item.menuItem?.name ?? "Страва"}</span>
                    <span className="font-medium">×{item.quantity}</span>
                  </li>
                ))}
              </ul>

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
            </li>
          );
        })}
      </ul>
    </main>
  );
}

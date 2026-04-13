"use client";

import { type OrderStatus } from "@prisma/client";
import { useEffect, useMemo, useState, useTransition } from "react";

import { getActiveOrders, type ActiveKitchenOrder } from "@/app/actions/getActiveOrders";
import { updateOrderStatus } from "@/app/actions/updateOrderStatus";

const POLL_INTERVAL_MS = 5000;

const formatOrderTime = (createdAt: string) =>
  new Date(createdAt).toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
  });

const getStatusBadgeStyles = (status: ActiveKitchenOrder["status"]) => {
  switch (status) {
    case "PENDING":
      return "bg-amber-100 text-amber-700";
    case "COOKING":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-neutral-100 text-neutral-700";
  }
};

export default function KitchenPage() {
  const [orders, setOrders] = useState<ActiveKitchenOrder[]>([]);
  const [updatingOrderIds, setUpdatingOrderIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, startTransition] = useTransition();

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async (isInitial = false) => {
      try {
        const data = await getActiveOrders();

        if (!isMounted) {
          return;
        }

        setOrders(data);
      } catch (error) {
        console.error("Failed to load kitchen orders", error);
      } finally {
        if (isInitial && isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadOrders(true);
    const intervalId = window.setInterval(() => {
      void loadOrders(false);
    }, POLL_INTERVAL_MS);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const onStatusChange = (orderId: number, status: OrderStatus) => {
    setUpdatingOrderIds((previous) => [...previous, orderId]);

    startTransition(async () => {
      try {
        await updateOrderStatus({ orderId, status });
        const refreshedOrders = await getActiveOrders();
        setOrders(refreshedOrders);
      } catch (error) {
        console.error("Failed to update order status", error);
      } finally {
        setUpdatingOrderIds((previous) => previous.filter((id) => id !== orderId));
      }
    });
  };

  const activeOrdersCount = useMemo(() => orders.length, [orders.length]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl p-6 md:p-10">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Кухня · Активні замовлення</h1>
          <p className="mt-1 text-sm text-neutral-500">Оновлення списку відбувається кожні 5 секунд.</p>
        </div>
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-sm font-medium text-neutral-700">
          Активних: {activeOrdersCount}
        </span>
      </header>

      {isLoading ? <p className="text-neutral-500">Завантажуємо замовлення…</p> : null}

      {!isLoading && orders.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-300 p-5 text-neutral-500">
          Наразі немає замовлень у статусі PENDING або COOKING.
        </p>
      ) : null}

      <ul className="space-y-4">
        {orders.map((order) => {
          const isUpdating = updatingOrderIds.includes(order.id);

          return (
            <li key={order.id} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <p className="text-base font-semibold">Замовлення #{order.id}</p>
                  <p className="text-sm text-neutral-500">Час: {formatOrderTime(order.createdAt)}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getStatusBadgeStyles(
                    order.status,
                  )}`}
                >
                  {order.status}
                </span>
              </div>

              <ul className="space-y-2">
                {order.items.map((item, index) => (
                  <li
                    key={`${order.id}-${item.menuItem?.name ?? "item"}-${index}`}
                    className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2 text-sm"
                  >
                    <span>{item.menuItem?.name ?? "Страва"}</span>
                    <span className="font-medium">×{item.quantity}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4">
                {order.status === "PENDING" ? (
                  <button
                    type="button"
                    onClick={() => onStatusChange(order.id, "COOKING")}
                    disabled={isUpdating}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Почати готувати
                  </button>
                ) : null}

                {order.status === "COOKING" ? (
                  <button
                    type="button"
                    onClick={() => onStatusChange(order.id, "READY")}
                    disabled={isUpdating}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Готово
                  </button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

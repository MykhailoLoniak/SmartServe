"use client";

import { type OrderStatus } from "@prisma/client";
import { useEffect, useMemo, useState, useTransition } from "react";

import { getActiveOrders, type ActiveKitchenOrder } from "@/app/actions/getActiveOrders";
import { updateOrderStatus } from "@/app/actions/updateOrderStatus";
import CookingTimer from "@/components/CookingTimer";
import { subscribeToKitchenOrderChanges } from "@/lib/supabase-browser";

type KitchenRealtimeBoardProps = {
  initialOrders: ActiveKitchenOrder[];
  refreshIntervalMs: number;
  activeStatuses: OrderStatus[];
};

const COURSE_BADGE_CLASSNAMES: Record<number, string> = {
  1: "bg-amber-100 text-amber-700",
  2: "bg-violet-100 text-violet-700",
  3: "bg-sky-100 text-sky-700",
};

const formatOrderTime = (createdAt: string) =>
  new Date(createdAt).toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
  });

const getNextItemStatus = (status: "PENDING" | "COOKING" | "READY") => {
  if (status === "PENDING") {
    return "COOKING";
  }

  if (status === "COOKING") {
    return "READY";
  }

  return null;
};

export default function KitchenRealtimeBoard({
  initialOrders,
  refreshIntervalMs,
  activeStatuses,
}: KitchenRealtimeBoardProps) {
  const [orders, setOrders] = useState<ActiveKitchenOrder[]>(initialOrders);
  const [updatingItemIds, setUpdatingItemIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  useEffect(() => {
    let isMounted = true;

    const refreshOrders = async () => {
      try {
        const data = await getActiveOrders({ statuses: activeStatuses });
        if (isMounted) {
          setOrders(data);
        }
      } catch (error) {
        console.error("Failed to refresh kitchen orders", error);
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
  }, [activeStatuses, refreshIntervalMs]);

  const onItemStatusChange = (orderItemId: number, status: "COOKING" | "READY") => {
    setUpdatingItemIds((previous) => [...previous, orderItemId]);

    startTransition(async () => {
      try {
        await updateOrderStatus({ orderItemId, status });
      } catch (error) {
        console.error("Failed to update order item status", error);
      } finally {
        setUpdatingItemIds((previous) => previous.filter((id) => id !== orderItemId));
      }
    });
  };

  const activeOrdersCount = useMemo(() => orders.length, [orders.length]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl p-6 md:p-10">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Кухня · Активні замовлення</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Оновлення списку відбувається кожні {Math.round(refreshIntervalMs / 1000)} секунд.
          </p>
        </div>
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-sm font-medium text-neutral-700">
          Активних: {activeOrdersCount}
        </span>
      </header>

      {isLoading ? <p className="text-neutral-500">Завантажуємо замовлення…</p> : null}

      {!isLoading && orders.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-300 p-5 text-neutral-500">
          Наразі немає замовлень в активних статусах.
        </p>
      ) : null}

      <ul className="space-y-4">
        {orders.map((order) => {
          const sortedItems = [...order.items].sort((a, b) => {
            if (a.course === b.course) {
              return a.id - b.id;
            }

            return a.course - b.course;
          });

          return (
            <li key={order.id} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <p className="text-base font-semibold">Замовлення #{order.id}</p>
                  <p className="text-sm text-neutral-500">Час: {formatOrderTime(order.createdAt)}</p>
                </div>
              </div>

              <ul className="space-y-2">
                {sortedItems.map((item) => {
                  const isUpdating = updatingItemIds.includes(item.id);
                  const nextStatus = getNextItemStatus(item.status);

                  return (
                    <li key={item.id} className="rounded-lg bg-neutral-50 p-3 text-sm">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="mb-1 flex items-center gap-2">
                            <span className="font-medium">{item.menuItem?.name ?? "Страва"}</span>
                            <span className="font-medium">×{item.quantity}</span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                COURSE_BADGE_CLASSNAMES[item.course] ?? "bg-neutral-200 text-neutral-700"
                              }`}
                            >
                              Курс {item.course}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-500">Статус: {item.status}</p>
                        </div>

                        <CookingTimer status={item.status} startedAt={item.startedAt} />
                      </div>

                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => onItemStatusChange(item.id, "COOKING")}
                          disabled={isUpdating || item.status !== "PENDING"}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Почати
                        </button>
                        <button
                          type="button"
                          onClick={() => onItemStatusChange(item.id, "READY")}
                          disabled={isUpdating || item.status !== "COOKING" || nextStatus !== "READY"}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Готово
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

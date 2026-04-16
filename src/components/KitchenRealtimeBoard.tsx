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

type OrdersTab = "active" | "completed";

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
  const [activeOrders, setActiveOrders] = useState<ActiveKitchenOrder[]>(initialOrders);
  const [completedOrders, setCompletedOrders] = useState<ActiveKitchenOrder[]>([]);
  const [activeTab, setActiveTab] = useState<OrdersTab>("active");
  const [updatingItemIds, setUpdatingItemIds] = useState<number[]>([]);
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
          getActiveOrders({ statuses: activeStatuses, mode: "active" }),
          getActiveOrders({ statuses: ["READY"], mode: "completed" }),
        ]);

        if (isMounted) {
          setActiveOrders(activeData);
          setCompletedOrders(completedData);
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

    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);
    const midnightTimeout = window.setTimeout(() => {
      void refreshOrders();
    }, Math.max(1_000, nextMidnight.getTime() - now.getTime() + 1_000));

    void refreshOrders().finally(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      window.clearTimeout(midnightTimeout);
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

  const orders = activeTab === "active" ? activeOrders : completedOrders;
  const ordersCount = useMemo(() => orders.length, [orders.length]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl p-6 md:p-10">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Кухня · Замовлення</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Оновлення списку відбувається кожні {Math.round(refreshIntervalMs / 1000)} секунд.
          </p>
        </div>
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-sm font-medium text-neutral-700">{ordersCount}</span>
      </header>

      <div className="mb-5 flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("active")}
          className={`rounded-xl px-4 py-2 text-sm font-medium ${
            activeTab === "active" ? "bg-black text-white" : "bg-neutral-100 text-neutral-700"
          }`}
        >
          Активні
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("completed")}
          className={`rounded-xl px-4 py-2 text-sm font-medium ${
            activeTab === "completed" ? "bg-black text-white" : "bg-neutral-100 text-neutral-700"
          }`}
        >
          Завершені
        </button>
      </div>

      {isLoading ? <p className="text-neutral-500">Завантажуємо замовлення…</p> : null}

      {!isLoading && orders.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-neutral-300 p-5 text-neutral-500">
          Усі замовлення видані. Чудова робота!
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
                  <p className="text-sm text-neutral-500">
                    {activeTab === "active" ? "Час:" : "Фінальний час:"} {formatOrderTime(order.completedAt ?? order.createdAt)}
                  </p>
                </div>
                <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold uppercase text-white">
                  Стіл №{order.tableNumber}
                </span>
              </div>

              <ul className="space-y-2">
                {sortedItems.map((item) => {
                  const isUpdating = updatingItemIds.includes(item.id);
                  const nextStatus = getNextItemStatus(item.status);
                  const isFinal = item.status === "READY";

                  return (
                    <li
                      key={item.id}
                      className={`rounded-lg bg-neutral-50 p-3 text-sm ${isFinal ? "opacity-50" : ""}`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="mb-1 flex items-center gap-2">
                            <span className={`font-medium ${isFinal ? "line-through" : ""}`}>
                              {item.menuItem?.name ?? "Страва"}
                            </span>
                            <span className={`font-medium ${isFinal ? "line-through" : ""}`}>×{item.quantity}</span>
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

                      {activeTab === "active" && !isFinal ? (
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
                      ) : null}
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

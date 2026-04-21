"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import { getActiveOrders, type ActiveKitchenOrder } from "@/app/actions/getActiveOrders";
import { closeTableBill, getWaiterTableReports, type WaiterTableReport } from "@/app/actions/waiterReportActions";
import { subscribeToKitchenOrderChanges } from "@/lib/supabase-browser";

type WaiterReadyBoardProps = {
  restaurantId?: number;
  initialTables: WaiterTableReport[];
  refreshIntervalMs: number;
};

type WaiterTab = "tables" | "completed";

const formatOrderTime = (createdAt: string) =>
  new Date(createdAt).toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
  });

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    maximumFractionDigits: 2,
  }).format(amount);

const STATUS_LABELS: Record<string, string> = {
  PENDING: "В роботі",
  COOKING: "Готується",
  READY: "Готово до подачі",
};

export default function WaiterReadyBoard({ restaurantId, initialTables, refreshIntervalMs }: WaiterReadyBoardProps) {
  const [tableReports, setTableReports] = useState<WaiterTableReport[]>(initialTables);
  const [completedOrders, setCompletedOrders] = useState<ActiveKitchenOrder[]>([]);
  const [activeTab, setActiveTab] = useState<WaiterTab>("tables");
  const [updatingTableIds, setUpdatingTableIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setTableReports(initialTables);
  }, [initialTables]);

  useEffect(() => {
    let isMounted = true;

    const refreshOrders = async () => {
      try {
        const [tablesData, completedData] = await Promise.all([
          getWaiterTableReports(restaurantId),
          getActiveOrders({ statuses: ["PAID"], mode: "completed", restaurantId }),
        ]);

        if (isMounted) {
          setTableReports(tablesData);
          setCompletedOrders(completedData);
        }
      } catch (error) {
        console.error("Failed to refresh waiter board", error);
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
  }, [refreshIntervalMs, restaurantId]);

  const onCloseBill = (tableId: number) => {
    setUpdatingTableIds((previous) => [...previous, tableId]);

    startTransition(async () => {
      try {
        await closeTableBill(tableId, restaurantId);
      } catch (error) {
        console.error("Failed to close table bill", error);
      } finally {
        setUpdatingTableIds((previous) => previous.filter((id) => id !== tableId));
      }
    });
  };

  const entitiesCount = useMemo(
    () => (activeTab === "tables" ? tableReports.length : completedOrders.length),
    [activeTab, completedOrders.length, tableReports.length],
  );

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl p-6 md:p-10">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-black">Офіціант · Столики та рахунки</h1>
          <p className="mt-1 text-sm text-black/60">Швидкий контроль готовності позицій і закриття рахунків.</p>
        </div>
        <span className="rounded-full bg-black/5 px-3 py-1 text-sm font-medium text-black">{entitiesCount}</span>
      </header>

      <div className="mb-5 flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("tables")}
          className={`rounded-xl px-4 py-2 text-sm font-medium ${
            activeTab === "tables" ? "bg-black text-white" : "bg-black/5 text-black"
          }`}
        >
          По столиках
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("completed")}
          className={`rounded-xl px-4 py-2 text-sm font-medium ${
            activeTab === "completed" ? "bg-black text-white" : "bg-black/5 text-black"
          }`}
        >
          Закриті сьогодні
        </button>
      </div>

      {isLoading ? <p className="text-black/60">Завантажуємо замовлення…</p> : null}

      {activeTab === "tables" ? (
        <ul className="space-y-4">
          {tableReports.map((report) => {
            const isUpdating = updatingTableIds.includes(report.tableId);

            return (
              <li key={report.tableId} className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-black">Стіл №{report.tableNumber}</p>
                    <p className="text-sm text-black/60">Активних замовлень: {report.orders.length}</p>
                  </div>
                  <p className="text-lg font-bold text-black">{formatCurrency(report.total)}</p>
                </div>

                <div className="space-y-3">
                  {report.orders.map((order) => (
                    <div key={order.id} className="rounded-xl border border-black/10 bg-[#f7f7f8] p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="font-medium text-black">Замовлення #{order.id}</p>
                        <p className="text-xs text-black/60">{formatOrderTime(order.createdAt)}</p>
                      </div>
                      <ul className="space-y-2">
                        {order.items.map((item) => {
                          const isReady = item.status === "READY";

                          return (
                            <li key={item.id} className={`rounded-lg px-3 py-2 text-sm ${isReady ? "bg-emerald-50" : "bg-white"}`}>
                              <div className="flex items-center justify-between gap-3">
                                <span className={isReady ? "font-medium" : ""}>
                                  {item.name} ×{item.quantity}
                                </span>
                                <span className="font-medium">{formatCurrency(item.priceAtTime)}</span>
                              </div>
                              <p className={`mt-1 text-xs ${isReady ? "text-emerald-700" : "text-black/60"}`}>
                                {STATUS_LABELS[item.status] ?? item.status}
                              </p>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-black/60">
                    {report.hasInProgressItems ? "Є позиції в роботі" : report.hasReadyItems ? "Усе готово до подачі" : "Очікування"}
                  </p>
                  <button
                    type="button"
                    onClick={() => onCloseBill(report.tableId)}
                    disabled={isUpdating || report.hasInProgressItems}
                    className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Закрити рахунок
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}

      {activeTab === "completed" ? (
        <ul className="space-y-4">
          {completedOrders.map((order) => (
            <li key={order.id} className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-black">Замовлення #{order.id}</p>
                <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold uppercase text-white">Стіл №{order.tableNumber}</span>
              </div>
              <p className="mt-2 text-sm text-black/60">Закрито о {formatOrderTime(order.completedAt ?? order.createdAt)}</p>
            </li>
          ))}
        </ul>
      ) : null}

      {!isLoading && entitiesCount === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-black/20 bg-white p-5 text-black/60">Даних для відображення немає.</p>
      ) : null}
    </main>
  );
}

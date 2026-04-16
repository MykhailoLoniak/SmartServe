"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import {
  createTable,
  createMenuItem,
  deleteTable,
  getManagerStats,
  getTablesSnapshot,
  deleteMenuItem,
  getCookingItems,
  type DashboardTable,
  toggleMenuItemAvailability,
  type DashboardCookingItem,
  type DashboardMenuItem,
  type ManagerPeriod,
  type ManagerStatsResponse,
  updateMenuItem,
} from "@/app/actions/adminDashboardActions";
import { getActiveOrders, type ActiveKitchenOrder } from "@/app/actions/getActiveOrders";
import { subscribeToKitchenOrderChanges } from "@/lib/supabase-browser";

type DashboardCategory = {
  id: number;
  name: string;
};

type AdminDashboardRealtimeProps = {
  initialCookingItems: DashboardCookingItem[];
  initialMenuItems: DashboardMenuItem[];
  categories: DashboardCategory[];
  initialActiveOrders: ActiveKitchenOrder[];
  initialCompletedOrders: ActiveKitchenOrder[];
  initialTables: DashboardTable[];
  initialManagerStats: ManagerStatsResponse;
};

type TabKey = "orders" | "menu" | "tables" | "stats";
type OrderViewTab = "active" | "completed";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    maximumFractionDigits: 2,
  }).format(amount);

const formatTime = (iso: string | null) => {
  if (!iso) {
    return "—";
  }

  return new Date(iso).toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const emptyForm = {
  id: "",
  name: "",
  description: "",
  price: "",
  categoryId: "",
  estimatedTime: "15",
};

export default function AdminDashboardRealtime({
  initialCookingItems,
  initialMenuItems,
  categories,
  initialActiveOrders,
  initialCompletedOrders,
  initialTables,
  initialManagerStats,
}: AdminDashboardRealtimeProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("orders");
  const [orderViewTab, setOrderViewTab] = useState<OrderViewTab>("active");
  const [cookingItems, setCookingItems] = useState(initialCookingItems);
  const [activeOrders, setActiveOrders] = useState(initialActiveOrders);
  const [completedOrders, setCompletedOrders] = useState(initialCompletedOrders);
  const [menuItems, setMenuItems] = useState(initialMenuItems);
  const [tables, setTables] = useState(initialTables);
  const [newTableNumber, setNewTableNumber] = useState("");
  const [managerPeriod, setManagerPeriod] = useState<ManagerPeriod>("today");
  const [managerStats, setManagerStats] = useState<ManagerStatsResponse>(initialManagerStats);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<"all" | "available" | "blocked">("all");
  const [formState, setFormState] = useState({
    ...emptyForm,
    categoryId: String(categories[0]?.id ?? ""),
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    setCookingItems(initialCookingItems);
    setActiveOrders(initialActiveOrders);
    setCompletedOrders(initialCompletedOrders);
  }, [initialActiveOrders, initialCompletedOrders, initialCookingItems]);

  useEffect(() => {
    setMenuItems(initialMenuItems);
  }, [initialMenuItems]);

  useEffect(() => {
    setTables(initialTables);
  }, [initialTables]);

  useEffect(() => {
    setManagerStats(initialManagerStats);
  }, [initialManagerStats]);

  useEffect(() => {
    const tickId = window.setInterval(() => {
      setNowMs(Date.now());
    }, 30_000);

    return () => window.clearInterval(tickId);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const refreshKitchenData = async () => {
      try {
        const [items, nextActiveOrders, nextCompletedOrders, nextTables] = await Promise.all([
          getCookingItems(),
          getActiveOrders({ statuses: ["PENDING", "COOKING"], mode: "active" }),
          getActiveOrders({ statuses: ["PAID"], mode: "completed" }),
          getTablesSnapshot(),
        ]);

        if (isMounted) {
          setCookingItems(items);
          setActiveOrders(nextActiveOrders);
          setCompletedOrders(nextCompletedOrders);
          setTables(nextTables);
        }
      } catch (error) {
        console.error("Failed to refresh kitchen items", error);
      }
    };

    const subscription = subscribeToKitchenOrderChanges({
      onChange: () => {
        void refreshKitchenData();
      },
    });

    const intervalId = window.setInterval(() => {
      void refreshKitchenData();
    }, 20_000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      subscription?.unsubscribe();
    };
  }, []);

  const rowsWithDelay = useMemo(
    () =>
      cookingItems.map((item) => {
        const elapsedMinutes = item.startedAt ? Math.max(0, Math.floor((nowMs - new Date(item.startedAt).getTime()) / 60000)) : 0;
        const critical = elapsedMinutes >= item.estimatedTime + 5;

        return {
          ...item,
          elapsedMinutes,
          critical,
        };
      }),
    [cookingItems, nowMs],
  );

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (categoryFilter !== "all" && String(item.categoryId) !== categoryFilter) {
        return false;
      }

      if (availabilityFilter === "available" && !item.isAvailable) {
        return false;
      }

      if (availabilityFilter === "blocked" && item.isAvailable) {
        return false;
      }

      return true;
    });
  }, [availabilityFilter, categoryFilter, menuItems]);

  const setEditMode = (item: DashboardMenuItem) => {
    setFormState({
      id: String(item.id),
      name: item.name,
      description: item.description ?? "",
      price: String(item.price),
      categoryId: String(item.categoryId),
      estimatedTime: String(item.estimatedTime),
    });
    setErrorMessage(null);
    setActiveTab("menu");
  };

  const resetForm = () => {
    setFormState({
      ...emptyForm,
      categoryId: String(categories[0]?.id ?? ""),
    });
    setErrorMessage(null);
  };

  const onSubmitMenuForm = () => {
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const formData = new FormData();
        if (formState.id) {
          formData.set("id", formState.id);
        }

        formData.set("name", formState.name);
        formData.set("description", formState.description);
        formData.set("price", formState.price);
        formData.set("categoryId", formState.categoryId);
        formData.set("estimatedTime", formState.estimatedTime);

        const nextMenuItems = formState.id ? await updateMenuItem(formData) : await createMenuItem(formData);
        setMenuItems(nextMenuItems);
        resetForm();
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Помилка збереження страви.");
      }
    });
  };

  const onToggleAvailability = (item: DashboardMenuItem) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("id", String(item.id));
        formData.set("isAvailable", String(!item.isAvailable));
        const nextMenuItems = await toggleMenuItemAvailability(formData);
        setMenuItems(nextMenuItems);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Не вдалося змінити стоп-лист.");
      }
    });
  };

  const onDeleteMenuItem = (id: number) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("id", String(id));
        const nextMenuItems = await deleteMenuItem(formData);
        setMenuItems(nextMenuItems);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Не вдалося видалити страву.");
      }
    });
  };

  const onCreateTable = () => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("number", newTableNumber);
        const nextTables = await createTable(formData);
        setTables(nextTables);
        setNewTableNumber("");
        setErrorMessage(null);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Не вдалося додати столик.");
      }
    });
  };

  const onDeleteTable = (tableId: number, activeOrdersCount: number) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("tableId", String(tableId));
        if (activeOrdersCount > 0) {
          const confirmed = window.confirm("Столик зайнятий активними замовленнями. Видалити примусово?");
          if (!confirmed) {
            return;
          }
          formData.set("forceDelete", "true");
        }
        const nextTables = await deleteTable(formData);
        setTables(nextTables);
        setErrorMessage(null);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Не вдалося видалити столик.");
      }
    });
  };

  const onManagerPeriodChange = (period: ManagerPeriod) => {
    setManagerPeriod(period);

    startTransition(async () => {
      try {
        const stats = await getManagerStats(period);
        setManagerStats(stats);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Не вдалося завантажити статистику.");
      }
    });
  };

  return (
    <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-wrap gap-2">
        {[
          { key: "orders" as const, label: "Активні замовлення" },
          { key: "menu" as const, label: "Редактор меню" },
          { key: "tables" as const, label: "Керування столиками" },
          { key: "stats" as const, label: "Статистика" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.key ? "bg-black text-white" : "bg-black/5 text-black hover:bg-black/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "orders" ? (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-black">Процес замовлень</h2>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setOrderViewTab("active")}
                className={`rounded-xl px-4 py-2 text-sm font-medium ${
                  orderViewTab === "active" ? "bg-black text-white" : "bg-black/5 text-black"
                }`}
              >
                Активні
              </button>
              <button
                type="button"
                onClick={() => setOrderViewTab("completed")}
                className={`rounded-xl px-4 py-2 text-sm font-medium ${
                  orderViewTab === "completed" ? "bg-black text-white" : "bg-black/5 text-black"
                }`}
              >
                Завершені
              </button>
            </div>
            <ul className="mt-4 space-y-3">
              {(orderViewTab === "active" ? activeOrders : completedOrders).map((order) => (
                <li key={order.id} className="rounded-2xl border border-black/10 bg-[#f7f7f8] p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-semibold text-black">Замовлення #{order.id}</p>
                    <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold uppercase text-white">
                      Стіл №{order.tableNumber}
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {order.items.map((item) => (
                      <li key={item.id} className={`text-sm ${item.status === "READY" ? "opacity-50 line-through" : ""}`}>
                        {item.menuItem?.name ?? "Страва"} ×{item.quantity}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
            {(orderViewTab === "active" ? activeOrders : completedOrders).length === 0 ? (
              <p className="mt-3 text-black/60">Усі замовлення видані. Чудова робота!</p>
            ) : null}
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black">Ефір затримок кухні</h2>
            {rowsWithDelay.length === 0 ? (
              <p className="text-black/60">Немає страв у статусі COOKING.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-black/10 text-left text-black/60">
                      <th className="px-3 py-2">Замовлення</th>
                      <th className="px-3 py-2">Стіл</th>
                      <th className="px-3 py-2">Страва</th>
                      <th className="px-3 py-2">Початок</th>
                      <th className="px-3 py-2">Факт (хв)</th>
                      <th className="px-3 py-2">Норма (хв)</th>
                      <th className="px-3 py-2">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rowsWithDelay.map((item) => (
                      <tr key={item.orderItemId} className={item.critical ? "bg-red-50 text-red-800" : "border-b border-black/5"}>
                        <td className="px-3 py-2 font-medium">#{item.orderId}</td>
                        <td className="px-3 py-2">#{item.tableNumber}</td>
                        <td className="px-3 py-2">
                          {item.menuItemName} ×{item.quantity}
                        </td>
                        <td className="px-3 py-2">{formatTime(item.startedAt)}</td>
                        <td className="px-3 py-2">{item.elapsedMinutes}</td>
                        <td className="px-3 py-2">{item.estimatedTime}</td>
                        <td className="px-3 py-2 font-semibold">{item.critical ? "Critical Delay" : "В нормі"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {activeTab === "menu" ? (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-semibold text-black">Редактор меню</h2>
            <p className="text-sm text-black/60">Додавання/редагування страв та керування стоп-листом у реальному часі.</p>
          </div>

          <div className="grid gap-3 rounded-xl border border-black/10 bg-[#f7f7f8] p-4 md:grid-cols-2">
            <label className="text-sm text-black/70">
              Назва страви
              <input
                value={formState.name}
                onChange={(event) => setFormState((previous) => ({ ...previous, name: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-black/20 bg-white px-3 py-2 outline-none focus:border-black"
                placeholder="Наприклад: Борщ"
              />
            </label>

            <label className="text-sm text-black/70">
              Ціна (₴)
              <input
                type="number"
                min="1"
                step="0.01"
                value={formState.price}
                onChange={(event) => setFormState((previous) => ({ ...previous, price: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-black/20 bg-white px-3 py-2 outline-none focus:border-black"
              />
            </label>

            <label className="text-sm text-black/70">
              Категорія
              <select
                value={formState.categoryId}
                onChange={(event) => setFormState((previous) => ({ ...previous, categoryId: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-black/20 bg-white px-3 py-2 outline-none focus:border-black"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm text-black/70">
              Орієнтовний час (хв)
              <input
                type="number"
                min="1"
                value={formState.estimatedTime}
                onChange={(event) => setFormState((previous) => ({ ...previous, estimatedTime: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-black/20 bg-white px-3 py-2 outline-none focus:border-black"
              />
            </label>

            <label className="text-sm text-black/70 md:col-span-2">
              Опис
              <textarea
                value={formState.description}
                onChange={(event) => setFormState((previous) => ({ ...previous, description: event.target.value }))}
                rows={3}
                className="mt-1 w-full rounded-lg border border-black/20 bg-white px-3 py-2 outline-none focus:border-black"
              />
            </label>

            <div className="flex gap-2 md:col-span-2">
              <button
                type="button"
                onClick={onSubmitMenuForm}
                disabled={isPending}
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {formState.id ? "Оновити страву" : "Додати страву"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={isPending}
                className="rounded-lg bg-black/10 px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
              >
                Очистити форму
              </button>
            </div>
          </div>

          {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}

          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm text-black/70">
              Фільтр за категорією
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="mt-1 w-full rounded-lg border border-black/20 px-3 py-2"
              >
                <option value="all">Усі категорії</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm text-black/70">
              Фільтр за наявністю
              <select
                value={availabilityFilter}
                onChange={(event) => setAvailabilityFilter(event.target.value as "all" | "available" | "blocked")}
                className="mt-1 w-full rounded-lg border border-black/20 px-3 py-2"
              >
                <option value="all">Усі</option>
                <option value="available">Лише в наявності</option>
                <option value="blocked">Лише стоп-лист</option>
              </select>
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-black/10 text-left text-black/60">
                  <th className="px-3 py-2">Страва</th>
                  <th className="px-3 py-2">Категорія</th>
                  <th className="px-3 py-2">Ціна</th>
                  <th className="px-3 py-2">Час</th>
                  <th className="px-3 py-2">Стоп-лист</th>
                  <th className="px-3 py-2">Дії</th>
                </tr>
              </thead>
              <tbody>
                {filteredMenuItems.map((item) => (
                  <tr key={item.id} className="border-b border-black/5">
                    <td className="px-3 py-2">
                      <p className="font-medium">{item.name}</p>
                      {item.description ? <p className="text-xs text-black/60">{item.description}</p> : null}
                    </td>
                    <td className="px-3 py-2">{item.categoryName}</td>
                    <td className="px-3 py-2">{formatCurrency(item.price)}</td>
                    <td className="px-3 py-2">{item.estimatedTime} хв</td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => onToggleAvailability(item)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.isAvailable ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.isAvailable ? "У меню" : "Стоп-лист"}
                      </button>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setEditMode(item)} className="rounded bg-black/10 px-2 py-1 text-xs">
                          Редагувати
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteMenuItem(item.id)}
                          className="rounded bg-red-100 px-2 py-1 text-xs text-red-700"
                        >
                          Видалити
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {activeTab === "stats" ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-black">Статистика за періоди</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { key: "today" as const, label: "Сьогодні" },
              { key: "yesterday" as const, label: "Вчора" },
              { key: "week" as const, label: "Поточний тиждень" },
              { key: "month" as const, label: "Поточний місяць" },
              { key: "previousMonth" as const, label: "Місяць тому" },
            ].map((period) => (
              <button
                key={period.key}
                type="button"
                onClick={() => onManagerPeriodChange(period.key)}
                className={`rounded-lg px-3 py-2 text-sm ${managerPeriod === period.key ? "bg-black text-white" : "bg-black/5 text-black"}`}
              >
                {period.label}
              </button>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-xl border border-black/10 bg-[#f7f7f8] p-4">
              <p className="text-sm text-black/60">Кількість замовлень</p>
              <p className="mt-2 text-3xl font-bold">{managerStats.ordersCount}</p>
            </article>
            <article className="rounded-xl border border-black/10 bg-[#f7f7f8] p-4">
              <p className="text-sm text-black/60">Виручка</p>
              <p className="mt-2 text-3xl font-bold">{formatCurrency(managerStats.revenue)}</p>
            </article>
            <article className="rounded-xl border border-black/10 bg-[#f7f7f8] p-4 md:col-span-2">
              <p className="text-sm text-black/60">Середній чек</p>
              <p className="mt-2 text-3xl font-bold">{formatCurrency(managerStats.averageCheck)}</p>
            </article>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-xl border border-black/10 bg-[#f7f7f8] p-4">
              <h3 className="mb-2 font-semibold">По днях</h3>
              <ul className="space-y-2 text-sm">
                {managerStats.byDays.map((row) => (
                  <li key={row.label} className="flex items-center justify-between">
                    <span>{row.label}</span>
                    <span>{row.ordersCount} · {formatCurrency(row.revenue)}</span>
                  </li>
                ))}
                {managerStats.byDays.length === 0 ? <li className="text-black/60">Немає даних.</li> : null}
              </ul>
            </article>
            <article className="rounded-xl border border-black/10 bg-[#f7f7f8] p-4">
              <h3 className="mb-2 font-semibold">По тижнях</h3>
              <ul className="space-y-2 text-sm">
                {managerStats.byWeeks.map((row) => (
                  <li key={row.label} className="flex items-center justify-between">
                    <span>{row.label}</span>
                    <span>{row.ordersCount} · {formatCurrency(row.revenue)}</span>
                  </li>
                ))}
                {managerStats.byWeeks.length === 0 ? <li className="text-black/60">Немає даних.</li> : null}
              </ul>
            </article>
          </div>
        </div>
      ) : null}

      {activeTab === "tables" ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-black">Керування столиками</h2>
          <div className="flex flex-wrap items-end gap-3 rounded-xl border border-black/10 bg-[#f7f7f8] p-4">
            <label className="text-sm text-black/70">
              Номер нового столика
              <input
                type="number"
                min={1}
                value={newTableNumber}
                onChange={(event) => setNewTableNumber(event.target.value)}
                className="mt-1 w-full rounded-lg border border-black/20 bg-white px-3 py-2"
              />
            </label>
            <button type="button" onClick={onCreateTable} className="rounded-lg bg-black px-4 py-2 text-sm text-white">
              Додати
            </button>
          </div>

          <ul className="space-y-3">
            {tables.map((table) => (
              <li key={table.id} className="flex items-center justify-between rounded-xl border border-black/10 bg-[#f7f7f8] p-4">
                <div>
                  <p className="font-medium">Стіл №{table.number}</p>
                  <p className="text-sm text-black/60">Активні замовлення: {table.activeOrdersCount}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteTable(table.id, table.activeOrdersCount)}
                  className="rounded-lg bg-red-100 px-3 py-1.5 text-sm text-red-700"
                >
                  Видалити
                </button>
              </li>
            ))}
            {tables.length === 0 ? <li className="text-black/60">Столики відсутні.</li> : null}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

"use client";

import { type OrderStatus } from "@prisma/client";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import { updateOrderStatus } from "@/app/actions/updateOrderStatus";
import { supabase } from "@/lib/supabase";

type KitchenOrderItem = {
  quantity: number;
  priceAtTime: number;
  menuItem: {
    name: string;
  } | null;
};

type KitchenOrder = {
  id: number;
  createdAt: string;
  status: "PENDING" | "COOKING" | "READY" | "PAID";
  items: KitchenOrderItem[];
};

const ORDER_DETAILS_SELECT = `
  id,
  createdAt,
  status,
  items:OrderItem(
    quantity,
    priceAtTime,
    menuItem:MenuItem(name)
  )
`;

const formatOrderTime = (createdAt: string) =>
  new Date(createdAt).toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
  });

type OrderRow = {
  id: number;
  createdAt: string;
  status: KitchenOrder["status"];
  items:
    | {
        quantity: number;
        priceAtTime: number | string;
        menuItem: {
          name: string;
        } | null;
      }[]
    | null;
};

const normalizeOrder = (data: OrderRow): KitchenOrder => ({
  id: data.id,
  createdAt: data.createdAt,
  status: data.status,
  items: Array.isArray(data.items)
    ? data.items.map((item) => ({
        quantity: item.quantity,
        priceAtTime: Number(item.priceAtTime),
        menuItem: item.menuItem,
      }))
    : [],
});

const getStatusBadgeStyles = (status: KitchenOrder["status"]) => {
  switch (status) {
    case "PENDING":
      return "bg-amber-100 text-amber-700";
    case "COOKING":
      return "bg-blue-100 text-blue-700";
    case "READY":
      return "bg-emerald-100 text-emerald-700";
    default:
      return "bg-neutral-100 text-neutral-700";
  }
};

async function fetchOrderDetails(orderId: number): Promise<KitchenOrder | null> {
  const { data, error } = await supabase
    .from("Order")
    .select(ORDER_DETAILS_SELECT)
    .eq("id", orderId)
    .single<OrderRow>();

  if (error || !data) {
    console.error("Failed to load order details", error);
    return null;
  }

  return normalizeOrder(data);
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [incomingOrderIds, setIncomingOrderIds] = useState<number[]>([]);
  const [updatingOrderIds, setUpdatingOrderIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, startTransition] = useTransition();
  const readyTimeoutsRef = useRef<Record<number, number>>({});

  useEffect(() => {
    let isMounted = true;

    const removeOrderAfterDelay = (orderId: number) => {
      const existingTimeout = readyTimeoutsRef.current[orderId];

      if (existingTimeout) {
        window.clearTimeout(existingTimeout);
      }

      readyTimeoutsRef.current[orderId] = window.setTimeout(() => {
        if (!isMounted) {
          return;
        }

        setOrders((previous) => previous.filter((order) => order.id !== orderId));
        delete readyTimeoutsRef.current[orderId];
      }, 5000);
    };

    const clearReadyRemoval = (orderId: number) => {
      const existingTimeout = readyTimeoutsRef.current[orderId];

      if (existingTimeout) {
        window.clearTimeout(existingTimeout);
        delete readyTimeoutsRef.current[orderId];
      }
    };

    const upsertOrder = (nextOrder: KitchenOrder) => {
      setOrders((previous) => {
        const withoutDuplicate = previous.filter((order) => order.id !== nextOrder.id);
        return [nextOrder, ...withoutDuplicate].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
      });

      if (nextOrder.status === "READY") {
        removeOrderAfterDelay(nextOrder.id);
      } else {
        clearReadyRemoval(nextOrder.id);
      }
    };

    const loadInitialOrders = async () => {
      const { data, error } = await supabase
        .from("Order")
        .select(ORDER_DETAILS_SELECT)
        .in("status", ["PENDING", "COOKING"])
        .order("createdAt", { ascending: false });

      if (!isMounted) {
        return;
      }

      if (error) {
        console.error("Failed to load kitchen orders", error);
        setIsLoading(false);
        return;
      }

      setOrders(((data ?? []) as OrderRow[]).map(normalizeOrder));
      setIsLoading(false);
    };

    void loadInitialOrders();

    const channel = supabase
      .channel("kitchen-orders")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Order",
        },
        async (payload) => {
          const insertedId = payload.new.id;

          if (typeof insertedId !== "number") {
            return;
          }

          const fullOrder = await fetchOrderDetails(insertedId);

          if (!fullOrder || !isMounted) {
            return;
          }

          upsertOrder(fullOrder);

          setIncomingOrderIds((previous) => [fullOrder.id, ...previous]);

          window.setTimeout(() => {
            if (!isMounted) {
              return;
            }

            setIncomingOrderIds((previous) => previous.filter((id) => id !== fullOrder.id));
          }, 1200);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "Order",
        },
        async (payload) => {
          const updatedId = payload.new.id;

          if (typeof updatedId !== "number") {
            return;
          }

          const fullOrder = await fetchOrderDetails(updatedId);

          if (!fullOrder || !isMounted) {
            return;
          }

          upsertOrder(fullOrder);
        },
      )
      .subscribe();

    return () => {
      isMounted = false;
      Object.values(readyTimeoutsRef.current).forEach((timeoutId) => window.clearTimeout(timeoutId));
      readyTimeoutsRef.current = {};
      void supabase.removeChannel(channel);
    };
  }, []);

  const onStatusChange = (orderId: number, status: OrderStatus) => {
    setUpdatingOrderIds((previous) => [...previous, orderId]);

    startTransition(async () => {
      try {
        await updateOrderStatus({ orderId, status });
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
          <h1 className="text-3xl font-bold">Кухня · Live замовлення</h1>
          <p className="mt-1 text-sm text-neutral-500">Оновлення приходять без перезавантаження сторінки.</p>
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
          const isIncoming = incomingOrderIds.includes(order.id);
          const isUpdating = updatingOrderIds.includes(order.id);

          return (
            <li
              key={order.id}
              className={`rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm ${
                isIncoming ? "kitchen-order--incoming" : ""
              }`}
            >
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

                {order.status === "READY" ? (
                  <p className="text-sm font-medium text-emerald-700">Готово! Замовлення зникне зі списку за кілька секунд.</p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

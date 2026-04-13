"use client";

import { useEffect, useMemo, useState } from "react";

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

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

          setOrders((previous) => {
            const withoutDuplicate = previous.filter((order) => order.id !== fullOrder.id);
            return [fullOrder, ...withoutDuplicate];
          });

          setIncomingOrderIds((previous) => [fullOrder.id, ...previous]);

          window.setTimeout(() => {
            if (!isMounted) {
              return;
            }

            setIncomingOrderIds((previous) => previous.filter((id) => id !== fullOrder.id));
          }, 1200);
        },
      )
      .subscribe();

    return () => {
      isMounted = false;
      void supabase.removeChannel(channel);
    };
  }, []);

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
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
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
            </li>
          );
        })}
      </ul>
    </main>
  );
}

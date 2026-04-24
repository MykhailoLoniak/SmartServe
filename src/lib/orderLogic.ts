import { OrderStatus } from "@prisma/client";

import { badRequest } from "@/lib/errors";

export type OrderDraftItem = {
  menuItemId: number;
  quantity: number;
  course: 1 | 2 | 3;
};

export type PricedOrderItem = OrderDraftItem & { priceAtTime: number };

export const priceOrderItems = (items: OrderDraftItem[], priceByMenuItemId: Map<number, number>): PricedOrderItem[] =>
  items.map((item) => {
    const priceAtTime = priceByMenuItemId.get(item.menuItemId);

    if (typeof priceAtTime !== "number" || priceAtTime <= 0) {
      throw badRequest("Не вдалося визначити ціну страви.");
    }

    return {
      ...item,
      priceAtTime,
    };
  });

export const calculateOrderTotal = (items: Pick<PricedOrderItem, "priceAtTime" | "quantity">[]) =>
  items.reduce((sum, item) => sum + item.priceAtTime * item.quantity, 0);

export const hasInProgressItems = (orders: { items: { status: OrderStatus }[] }[]) =>
  orders.some((order) => order.items.some((item) => item.status !== "SERVED"));

export const deriveOrderStatusByItems = (statuses: Array<"PENDING" | "COOKING" | "READY">) => {
  const allReady = statuses.every((itemStatus) => itemStatus === "READY");
  if (allReady) {
    return "READY" as const;
  }

  return statuses.some((itemStatus) => itemStatus === "COOKING") ? ("COOKING" as const) : ("PENDING" as const);
};

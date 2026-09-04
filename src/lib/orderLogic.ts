import { OrderStatus } from "@prisma/client";

import { badRequest } from "./errors";

export type OrderDraftItem = {
  menuItemId: number;
  quantity: number;
  course: 1 | 2 | 3;
};

export type PricedOrderItem = OrderDraftItem & { priceAtTime: number };

export type OrderLevelStatus = Exclude<OrderStatus, "SERVED">;
export type OrderItemStatus = Exclude<OrderStatus, "PAID">;

const ORDER_STATUS_TRANSITIONS: Record<OrderLevelStatus, readonly OrderLevelStatus[]> = {
  PENDING: ["COOKING"],
  COOKING: ["READY"],
  READY: ["PAID"],
  PAID: [],
};

const ORDER_ITEM_STATUS_TRANSITIONS: Record<OrderItemStatus, readonly OrderItemStatus[]> = {
  PENDING: ["COOKING", "SERVED"],
  COOKING: ["READY"],
  READY: ["SERVED"],
  SERVED: [],
};

const isOrderLevelStatus = (status: OrderStatus): status is OrderLevelStatus => status !== "SERVED";
const isOrderItemStatus = (status: OrderStatus): status is OrderItemStatus => status !== "PAID";

export const canTransitionOrderStatus = (current: OrderStatus, next: OrderStatus) =>
  isOrderLevelStatus(current) &&
  isOrderLevelStatus(next) &&
  (current === next || ORDER_STATUS_TRANSITIONS[current].includes(next));

export const canTransitionOrderItemStatus = (current: OrderStatus, next: OrderStatus) =>
  isOrderItemStatus(current) &&
  isOrderItemStatus(next) &&
  (current === next || ORDER_ITEM_STATUS_TRANSITIONS[current].includes(next));

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

export const deriveOrderStatusByItems = (statuses: OrderStatus[]) => {
  const allReady = statuses.every((itemStatus) => itemStatus === "READY" || itemStatus === "SERVED");
  if (allReady) {
    return "READY" as const;
  }

  return statuses.some((itemStatus) => itemStatus === "COOKING") ? ("COOKING" as const) : ("PENDING" as const);
};

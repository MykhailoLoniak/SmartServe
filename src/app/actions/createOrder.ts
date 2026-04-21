"use server";

import { calculateOrderTotal, priceOrderItems, type OrderDraftItem } from "@/lib/orderLogic";
import { badRequest, notFound } from "@/lib/errors";
import { createRequestId, logEvent } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { createOrderSchema } from "@/lib/validation";

type CreateOrderItemInput = OrderDraftItem;

type CreateOrderInput = {
  tableId: number;
  items: CreateOrderItemInput[];
};

export async function createOrder(input: CreateOrderInput) {
  const requestId = createRequestId();
  const parsed = createOrderSchema.safeParse(input);

  if (!parsed.success) {
    throw badRequest("Некоректні дані замовлення", { issues: parsed.error.flatten(), requestId });
  }

  const { tableId, items } = parsed.data;

  const table = await prisma.table.findUnique({
    where: { id: tableId },
    select: { id: true, restaurantId: true },
  });

  if (!table) {
    throw notFound("Стіл не знайдено");
  }

  const menuItemIds = [...new Set(items.map((item) => item.menuItemId))];
  const availableMenuItems = await prisma.menuItem.findMany({
    where: {
      id: { in: menuItemIds },
      isAvailable: true,
      category: { restaurantId: table.restaurantId },
    },
    select: { id: true, price: true },
  });

  if (availableMenuItems.length !== menuItemIds.length) {
    throw badRequest("У замовленні є недоступні позиції");
  }

  const priceByMenuItemId = new Map(availableMenuItems.map((item) => [item.id, Number(item.price)]));
  const normalizedItems = priceOrderItems(items, priceByMenuItemId);
  const totalPrice = calculateOrderTotal(normalizedItems);

  const order = await prisma.$transaction(async (tx) => {
    const createdOrder = await tx.order.create({
      data: {
        tableId,
        status: "PENDING",
        totalPrice,
      },
    });

    await tx.orderItem.createMany({
      data: normalizedItems.map((item) => ({
        orderId: createdOrder.id,
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        priceAtTime: item.priceAtTime,
        course: item.course,
      })),
    });

    return createdOrder;
  });

  logEvent("order.create", { requestId, orderId: order.id, restaurantId: table.restaurantId, tableId });
  return { orderId: order.id };
}

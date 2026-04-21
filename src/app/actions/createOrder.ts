"use server";

import { calculateOrderTotal, priceOrderItems, type OrderDraftItem } from "@/lib/orderLogic";
import { prisma } from "@/lib/prisma";

type CreateOrderItemInput = OrderDraftItem;

type CreateOrderInput = {
  tableId: number;
  items: CreateOrderItemInput[];
};

const isValidOrder = ({ tableId, items }: CreateOrderInput) => {
  if (!Number.isInteger(tableId) || tableId <= 0) {
    return false;
  }

  return (
    Array.isArray(items) &&
    items.length > 0 &&
    items.every(
      (item) =>
        Number.isInteger(item.menuItemId) &&
        item.menuItemId > 0 &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0 &&
        Number.isInteger(item.course) &&
        item.course >= 1 &&
        item.course <= 3,
    )
  );
};

export async function createOrder(input: CreateOrderInput) {
  if (!isValidOrder(input)) {
    throw new Error("Некоректні дані замовлення");
  }

  const { tableId, items } = input;

  const table = await prisma.table.findUnique({
    where: { id: tableId },
    select: { id: true, restaurantId: true },
  });

  if (!table) {
    throw new Error("Стіл не знайдено");
  }

  const menuItemIds = [...new Set(items.map((item) => item.menuItemId))];
  const availableMenuItems = await prisma.menuItem.findMany({
    where: {
      id: {
        in: menuItemIds,
      },
      isAvailable: true,
      category: {
        restaurantId: table.restaurantId,
      },
    },
    select: { id: true, price: true },
  });

  if (availableMenuItems.length !== menuItemIds.length) {
    throw new Error("У замовленні є позиції, які недоступні або не належать до цього закладу.");
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

  return { orderId: order.id };
}

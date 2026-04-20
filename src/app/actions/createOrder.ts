"use server";

import { prisma } from "@/lib/prisma";

type CreateOrderItemInput = {
  id: number;
  quantity: number;
  priceAtTime: number;
  course: 1 | 2 | 3;
};

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
        Number.isInteger(item.id) &&
        item.id > 0 &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0 &&
        typeof item.priceAtTime === "number" &&
        item.priceAtTime > 0 &&
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

  const menuItemIds = [...new Set(items.map((item) => item.id))];
  const availableMenuItems = await prisma.menuItem.findMany({
    where: {
      id: {
        in: menuItemIds,
      },
      category: {
        restaurantId: table.restaurantId,
      },
    },
    select: { id: true },
  });

  if (availableMenuItems.length !== menuItemIds.length) {
    throw new Error("У замовленні є позиції, що не належать до цього закладу.");
  }

  const totalPrice = items.reduce((sum, item) => sum + item.priceAtTime * item.quantity, 0);

  const order = await prisma.$transaction(async (tx) => {
    const createdOrder = await tx.order.create({
      data: {
        tableId,
        status: "PENDING",
        totalPrice,
      },
    });

    await tx.orderItem.createMany({
      data: items.map((item) => ({
        orderId: createdOrder.id,
        menuItemId: item.id,
        quantity: item.quantity,
        priceAtTime: item.priceAtTime,
        course: item.course,
      })),
    });

    return createdOrder;
  });

  return { orderId: order.id };
}

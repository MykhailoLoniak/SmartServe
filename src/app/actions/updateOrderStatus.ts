"use server";

import { OrderStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type UpdateOrderStatusInput = {
  orderId: number;
  status: OrderStatus;
};

const ORDER_STATUSES = new Set(Object.values(OrderStatus));

const isValidInput = ({ orderId, status }: UpdateOrderStatusInput) => {
  return Number.isInteger(orderId) && orderId > 0 && ORDER_STATUSES.has(status);
};

export async function updateOrderStatus(input: UpdateOrderStatusInput) {
  if (!isValidInput(input)) {
    throw new Error("Некоректні дані для оновлення статусу");
  }

  await prisma.order.update({
    where: { id: input.orderId },
    data: { status: input.status },
  });
}

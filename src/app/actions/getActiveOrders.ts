"use server";

import { type OrderStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type ActiveKitchenOrder = {
  id: number;
  createdAt: string;
  status: OrderStatus;
  items: {
    quantity: number;
    priceAtTime: number;
    menuItem: {
      name: string;
    } | null;
  }[];
};

type GetActiveOrdersInput = {
  statuses: OrderStatus[];
};

export async function getActiveOrders({ statuses }: GetActiveOrdersInput): Promise<ActiveKitchenOrder[]> {
  const orders = await prisma.order.findMany({
    where: {
      status: {
        in: statuses,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      createdAt: true,
      status: true,
      items: {
        select: {
          quantity: true,
          priceAtTime: true,
          menuItem: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  return orders.map((order) => ({
    id: order.id,
    createdAt: order.createdAt.toISOString(),
    status: order.status,
    items: order.items.map((item) => ({
      quantity: item.quantity,
      priceAtTime: Number(item.priceAtTime),
      menuItem: item.menuItem,
    })),
  }));
}

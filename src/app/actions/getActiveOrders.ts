"use server";

import { prisma } from "@/lib/prisma";

export type ActiveKitchenOrder = {
  id: number;
  createdAt: string;
  status: "PENDING" | "COOKING";
  items: {
    quantity: number;
    priceAtTime: number;
    menuItem: {
      name: string;
    } | null;
  }[];
};

export async function getActiveOrders(): Promise<ActiveKitchenOrder[]> {
  const orders = await prisma.order.findMany({
    where: {
      status: {
        in: ["PENDING", "COOKING"],
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

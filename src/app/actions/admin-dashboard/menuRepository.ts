import { prisma } from "@/lib/prisma";

export const findMenuItemsForRestaurant = (restaurantId: number) =>
  prisma.menuItem.findMany({
    where: {
      category: {
        restaurantId,
      },
    },
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      estimatedTime: true,
      isAvailable: true,
      categoryId: true,
      category: {
        select: {
          name: true,
        },
      },
    },
  });

export const findCategoryInRestaurant = (categoryId: number, restaurantId: number) =>
  prisma.category.findFirst({
    where: {
      id: categoryId,
      restaurantId,
    },
    select: { id: true },
  });

export const findMenuItemInRestaurant = (menuItemId: number, restaurantId: number) =>
  prisma.menuItem.findFirst({
    where: {
      id: menuItemId,
      category: {
        restaurantId,
      },
    },
    select: { id: true },
  });

export const createMenuItemRecord = (data: {
  name: string;
  description: string | null;
  price: number;
  estimatedTime: number;
  categoryId: number;
}) =>
  prisma.menuItem.create({
    data: {
      ...data,
      isAvailable: true,
    },
  });

export const updateMenuItemRecord = (
  menuItemId: number,
  data: {
    name: string;
    description: string | null;
    price: number;
    estimatedTime: number;
    categoryId: number;
  },
) =>
  prisma.menuItem.update({
    where: { id: menuItemId },
    data,
  });

export const deleteMenuItemRecord = (menuItemId: number) =>
  prisma.menuItem.delete({
    where: { id: menuItemId },
  });

export const updateMenuItemAvailabilityRecord = (menuItemId: number, isAvailable: boolean) =>
  prisma.menuItem.update({
    where: { id: menuItemId },
    data: { isAvailable },
  });

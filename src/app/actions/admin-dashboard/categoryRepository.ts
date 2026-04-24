import { prisma } from "@/lib/prisma";

export const DEFAULT_CATEGORY_NAME = "Без категорії";

export const findCategoriesForRestaurant = (restaurantId: number) =>
  prisma.category.findMany({
    where: { restaurantId },
    orderBy: [{ name: "asc" }, { id: "asc" }],
    select: {
      id: true,
      name: true,
    },
  });

export const findCategoryByIdInRestaurant = (categoryId: number, restaurantId: number) =>
  prisma.category.findFirst({
    where: { id: categoryId, restaurantId },
    select: { id: true, name: true },
  });

export const findCategoryByNameInRestaurant = (name: string, restaurantId: number) =>
  prisma.category.findFirst({
    where: {
      restaurantId,
      name,
    },
    select: { id: true },
  });

export const createCategoryRecord = (name: string, restaurantId: number) =>
  prisma.category.create({
    data: {
      name,
      restaurantId,
    },
    select: { id: true, name: true },
  });

export const updateCategoryRecord = (id: number, name: string) =>
  prisma.category.update({
    where: { id },
    data: { name },
    select: { id: true, name: true },
  });

export const deleteCategoryRecord = (id: number) =>
  prisma.category.delete({
    where: { id },
  });

export const countMenuItemsForCategory = (categoryId: number) =>
  prisma.menuItem.count({
    where: { categoryId },
  });

export const ensureDefaultCategory = async (restaurantId: number) => {
  const existing = await prisma.category.findFirst({
    where: {
      restaurantId,
      name: DEFAULT_CATEGORY_NAME,
    },
    select: { id: true, name: true },
  });

  if (existing) {
    return existing;
  }

  return createCategoryRecord(DEFAULT_CATEGORY_NAME, restaurantId);
};

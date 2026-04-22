import type { ActiveKitchenOrder } from "@/app/actions/getActiveOrders";

export const sortOrdersByCreatedAtDesc = (orders: ActiveKitchenOrder[]) =>
  [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

export const sortOrderItemsByCourseAndId = <T extends { course: number; id: number }>(items: T[]) =>
  [...items].sort((a, b) => {
    if (a.course === b.course) {
      return a.id - b.id;
    }

    return a.course - b.course;
  });

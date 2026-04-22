import type { ActiveKitchenOrder } from "@/app/actions/getActiveOrders";

export const COURSE_BADGE_CLASSNAMES: Record<number, string> = {
  1: "bg-amber-100 text-amber-700",
  2: "bg-violet-100 text-violet-700",
  3: "bg-sky-100 text-sky-700",
};

export const getNextItemStatus = (status: "PENDING" | "COOKING" | "READY") => {
  if (status === "PENDING") {
    return "COOKING";
  }

  if (status === "COOKING") {
    return "READY";
  }

  return null;
};

export const getDisplayOrderTime = (order: ActiveKitchenOrder) => order.completedAt ?? order.createdAt;

import { OrderStatus } from "@prisma/client";

const DEFAULT_REFRESH_INTERVAL_MS = 5000;

const KITCHEN_ALLOWED_STATUSES = new Set<OrderStatus>([OrderStatus.PENDING, OrderStatus.COOKING]);

const configuredStatuses = process.env.NEXT_PUBLIC_KITCHEN_ACTIVE_STATUSES?.split(",")
  .map((status) => status.trim())
  .filter((status): status is OrderStatus => KITCHEN_ALLOWED_STATUSES.has(status as OrderStatus));

const parsedInterval = Number(process.env.NEXT_PUBLIC_KITCHEN_REFRESH_INTERVAL_MS);

export const KITCHEN_ACTIVE_STATUSES: OrderStatus[] =
  configuredStatuses && configuredStatuses.length > 0
    ? configuredStatuses
    : [OrderStatus.PENDING, OrderStatus.COOKING];

export const KITCHEN_REFRESH_INTERVAL_MS =
  Number.isFinite(parsedInterval) && parsedInterval > 0 ? parsedInterval : DEFAULT_REFRESH_INTERVAL_MS;

export const KITCHEN_STATUS_UI: Record<OrderStatus, { label: string; badgeClassName: string }> = {
  [OrderStatus.PENDING]: {
    label: "Очікує",
    badgeClassName: "bg-amber-100 text-amber-700",
  },
  [OrderStatus.COOKING]: {
    label: "Готується",
    badgeClassName: "bg-blue-100 text-blue-700",
  },
  [OrderStatus.READY]: {
    label: "Готово",
    badgeClassName: "bg-emerald-100 text-emerald-700",
  },
  [OrderStatus.SERVED]: {
    label: "Подано",
    badgeClassName: "bg-purple-100 text-purple-700",
  },
  [OrderStatus.PAID]: {
    label: "Оплачено",
    badgeClassName: "bg-neutral-100 text-neutral-700",
  },
};

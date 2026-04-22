import { CURRENCY_SYMBOL } from "@/lib/ui-config";

export const formatPrice = (price: number) => `${price.toFixed(2)} ${CURRENCY_SYMBOL}`;

export const formatItemPriceLine = (quantity: number, price: number) =>
  `${quantity} × ${formatPrice(price)}`;

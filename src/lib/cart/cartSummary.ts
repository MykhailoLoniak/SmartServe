import { CART_MESSAGES } from "@/lib/ui-config";
import { type CartItem } from "@/store/useCartStore";

import { getTotalQuantity } from "./cartSelectors";

type BuildCartSummaryParams = {
  items: CartItem[];
  totalPrice: number;
  tableId: number | null;
  message: string | null;
};

export const buildCartSummary = ({ items, totalPrice, tableId, message }: BuildCartSummaryParams) => {
  const totalQuantity = getTotalQuantity(items);

  return {
    items,
    tableId,
    totalPrice,
    totalQuantity,
    hasItems: totalQuantity > 0,
    shouldRender: totalQuantity > 0 || Boolean(message),
    tableLabel: tableId ?? CART_MESSAGES.unknownTable,
  };
};

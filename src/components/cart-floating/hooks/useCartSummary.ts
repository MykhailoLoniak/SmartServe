import { useMemo } from "react";

import { buildCartSummary } from "@/lib/cart/cartSummary";
import { useCartState } from "@/lib/cart/cartSelectors";

export const useCartSummary = (message: string | null) => {
  const { items, tableId, totalPrice } = useCartState();

  return useMemo(
    () => buildCartSummary({ items, totalPrice, tableId, message }),
    [items, totalPrice, tableId, message],
  );
};

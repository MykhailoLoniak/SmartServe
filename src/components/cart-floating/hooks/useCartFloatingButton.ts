import { useCallback, useRef, useState, useTransition } from "react";

import { createOrder } from "@/app/actions/createOrder";
import { useCartState } from "@/lib/cart/cartSelectors";
import { CART_MESSAGES } from "@/lib/ui-config";

type UseCartFloatingButtonParams = {
  clearCart: () => void;
};

export const useCartFloatingButton = ({ clearCart }: UseCartFloatingButtonParams) => {
  const { tableId, tableToken, items } = useCartState();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const idempotencyKeyRef = useRef<string | null>(null);

  const openDrawer = useCallback(() => setIsOpen(true), []);
  const closeDrawer = useCallback(() => setIsOpen(false), []);

  const handleCreateOrder = useCallback(() => {
    if (!tableId || !tableToken) {
      setMessage(CART_MESSAGES.missingTableId);
      return;
    }

    setMessage(null);
    idempotencyKeyRef.current ??= crypto.randomUUID();
    const idempotencyKey = idempotencyKeyRef.current;

    startTransition(async () => {
      try {
        await createOrder({
          tableToken,
          idempotencyKey,
          items: items.map((item) => ({
            menuItemId: Number(item.id),
            quantity: item.quantity,
            course: item.course,
          })),
        });

        clearCart();
        idempotencyKeyRef.current = null;
        setMessage(CART_MESSAGES.orderAccepted);
        closeDrawer();
      } catch {
        setMessage(CART_MESSAGES.orderFailed);
      }
    });
  }, [clearCart, closeDrawer, items, tableId, tableToken]);

  return {
    isOpen,
    message,
    isPending,
    openDrawer,
    closeDrawer,
    handleCreateOrder,
  };
};

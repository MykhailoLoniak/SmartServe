import { useCallback, useState, useTransition } from "react";

import { createOrder } from "@/app/actions/createOrder";
import { useCartState } from "@/lib/cart/cartSelectors";
import { CART_MESSAGES } from "@/lib/ui-config";

type UseCartFloatingButtonParams = {
  clearCart: () => void;
};

export const useCartFloatingButton = ({ clearCart }: UseCartFloatingButtonParams) => {
  const { tableId, items } = useCartState();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const openDrawer = useCallback(() => setIsOpen(true), []);
  const closeDrawer = useCallback(() => setIsOpen(false), []);

  const handleCreateOrder = useCallback(() => {
    if (!tableId) {
      setMessage(CART_MESSAGES.missingTableId);
      return;
    }

    setMessage(null);

    startTransition(async () => {
      try {
        await createOrder({
          tableId,
          items: items.map((item) => ({
            menuItemId: Number(item.id),
            quantity: item.quantity,
            course: item.course,
          })),
        });

        clearCart();
        setMessage(CART_MESSAGES.orderAccepted);
        closeDrawer();
      } catch {
        setMessage(CART_MESSAGES.orderFailed);
      }
    });
  }, [clearCart, closeDrawer, items, tableId]);

  return {
    isOpen,
    message,
    isPending,
    openDrawer,
    closeDrawer,
    handleCreateOrder,
  };
};

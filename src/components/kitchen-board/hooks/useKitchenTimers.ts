import { useState, useTransition } from "react";

import { updateOrderStatus } from "@/app/actions/updateOrderStatus";

type KitchenItemStatus = "COOKING" | "READY";

export const useKitchenTimers = (restaurantId?: number) => {
  const [updatingItemIds, setUpdatingItemIds] = useState<number[]>([]);
  const [, startTransition] = useTransition();

  const onItemStatusChange = (orderItemId: number, status: KitchenItemStatus) => {
    setUpdatingItemIds((previous) => [...previous, orderItemId]);

    startTransition(async () => {
      try {
        await updateOrderStatus({ orderItemId, status }, restaurantId);
      } catch (error) {
        console.error("Failed to update order item status", error);
      } finally {
        setUpdatingItemIds((previous) => previous.filter((id) => id !== orderItemId));
      }
    });
  };

  return {
    onItemStatusChange,
    updatingItemIds,
  };
};

"use client";

import { type OrderStatus } from "@prisma/client";
import { useMemo } from "react";

import { type ActiveKitchenOrder } from "@/app/actions/getActiveOrders";
import { KitchenBoardFilters } from "@/components/kitchen-board/components/KitchenBoardFilters";
import { KitchenBoardHeader } from "@/components/kitchen-board/components/KitchenBoardHeader";
import { KitchenEmptyState } from "@/components/kitchen-board/components/KitchenEmptyState";
import { KitchenLoadingState } from "@/components/kitchen-board/components/KitchenLoadingState";
import { KitchenOrderCard } from "@/components/kitchen-board/components/KitchenOrderCard";
import { sortOrdersByCreatedAtDesc } from "@/components/kitchen-board/helpers/kitchenBoardSorting";
import { useKitchenFilters } from "@/components/kitchen-board/hooks/useKitchenFilters";
import { useKitchenRealtime } from "@/components/kitchen-board/hooks/useKitchenRealtime";
import { useKitchenTimers } from "@/components/kitchen-board/hooks/useKitchenTimers";

type KitchenRealtimeBoardProps = {
  restaurantId?: number;
  initialOrders: ActiveKitchenOrder[];
  refreshIntervalMs: number;
  activeStatuses: OrderStatus[];
};

export default function KitchenRealtimeBoard({
  restaurantId,
  initialOrders,
  refreshIntervalMs,
  activeStatuses,
}: KitchenRealtimeBoardProps) {
  const { activeOrders, completedOrders, isLoading } = useKitchenRealtime({
    activeStatuses,
    initialOrders,
    refreshIntervalMs,
    restaurantId,
  });
  const { activeTab, setActiveTab, orders, ordersCount } = useKitchenFilters({ activeOrders, completedOrders });
  const { onItemStatusChange, updatingItemIds } = useKitchenTimers(restaurantId);

  const sortedOrders = useMemo(() => sortOrdersByCreatedAtDesc(orders), [orders]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl p-6 md:p-10">
      <KitchenBoardHeader ordersCount={ordersCount} refreshIntervalMs={refreshIntervalMs} />
      <KitchenBoardFilters activeTab={activeTab} setActiveTab={setActiveTab} />

      {isLoading ? <KitchenLoadingState /> : null}
      {!isLoading && orders.length === 0 ? <KitchenEmptyState /> : null}

      <ul className="space-y-4">
        {sortedOrders.map((order) => (
          <KitchenOrderCard
            key={order.id}
            activeTab={activeTab}
            onItemStatusChange={onItemStatusChange}
            order={order}
            updatingItemIds={updatingItemIds}
          />
        ))}
      </ul>
    </main>
  );
}

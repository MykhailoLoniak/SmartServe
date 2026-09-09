"use client";

import { useState, useTransition } from "react";

import {
  closeTableBill,
  getClosedOrderDetails,
  markOrderItemServed,
  type ClosedOrderDetails,
  type WaiterTableReport,
} from "@/app/actions/waiterReportActions";

import { WaiterBoardFilters } from "./waiter-board/components/WaiterBoardFilters";
import { WaiterBoardHeader } from "./waiter-board/components/WaiterBoardHeader";
import { WaiterCompletedOrderCard } from "./waiter-board/components/WaiterCompletedOrderCard";
import { WaiterClosedOrderDetailsModal } from "./waiter-board/components/WaiterClosedOrderDetailsModal";
import { WaiterEmptyState } from "./waiter-board/components/WaiterEmptyState";
import { WaiterLoadingState } from "./waiter-board/components/WaiterLoadingState";
import { WaiterOrderCard } from "./waiter-board/components/WaiterOrderCard";
import { useWaiterFilters } from "./waiter-board/hooks/useWaiterFilters";
import { useWaiterRealtime } from "./waiter-board/hooks/useWaiterRealtime";
import { useWaiterTimers } from "./waiter-board/hooks/useWaiterTimers";
import { isTablesTab } from "./waiter-board/helpers/waiterBoardFilters";

type WaiterReadyBoardProps = {
  restaurantId?: number;
  initialTables: WaiterTableReport[];
  refreshIntervalMs: number;
};

export default function WaiterReadyBoard({ restaurantId, initialTables, refreshIntervalMs }: WaiterReadyBoardProps) {
  const [updatingTableIds, setUpdatingTableIds] = useState<number[]>([]);
  const [servingItemIds, setServingItemIds] = useState<number[]>([]);
  const [selectedClosedOrderDetails, setSelectedClosedOrderDetails] = useState<ClosedOrderDetails | null>(null);
  const [selectedClosedOrderError, setSelectedClosedOrderError] = useState<string | null>(null);
  const [isClosedOrderLoading, setIsClosedOrderLoading] = useState(false);
  const [, startTransition] = useTransition();
  const { nowTimestamp } = useWaiterTimers();
  const { completedOrders, isLoading, refreshOrders, tableReports } = useWaiterRealtime({ initialTables, refreshIntervalMs, restaurantId });
  const { activeTab, entitiesCount, setActiveTab, sortedCompletedOrders, sortedTableReports } = useWaiterFilters({
    completedOrders,
    tableReports,
  });

  const onCloseBill = (tableId: number) => {
    setUpdatingTableIds((previous) => [...previous, tableId]);

    startTransition(async () => {
      try {
        await closeTableBill(tableId, restaurantId);
        await refreshOrders();
      } catch (error) {
        console.error("Failed to close table bill", error);
      } finally {
        setUpdatingTableIds((previous) => previous.filter((id) => id !== tableId));
      }
    });
  };

  const onMarkServed = (orderItemId: number) => {
    if (servingItemIds.includes(orderItemId)) {
      return;
    }

    setServingItemIds((previous) => [...previous, orderItemId]);

    startTransition(async () => {
      try {
        await markOrderItemServed(orderItemId, restaurantId);
        await refreshOrders();
      } catch (error) {
        console.error("Failed to mark item as served", error);
      } finally {
        setServingItemIds((previous) => previous.filter((id) => id !== orderItemId));
      }
    });
  };

  const onOpenClosedOrderDetails = (orderId: number) => {
    setSelectedClosedOrderDetails(null);
    setSelectedClosedOrderError(null);
    setIsClosedOrderLoading(true);

    startTransition(async () => {
      try {
        const details = await getClosedOrderDetails(orderId, restaurantId);
        setSelectedClosedOrderDetails(details);
      } catch (error) {
        setSelectedClosedOrderError(error instanceof Error ? error.message : "Could not load details.");
      } finally {
        setIsClosedOrderLoading(false);
      }
    });
  };

  const onCloseClosedOrderDetails = () => {
    setSelectedClosedOrderDetails(null);
    setSelectedClosedOrderError(null);
    setIsClosedOrderLoading(false);
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl p-6 md:p-10">
      <WaiterBoardHeader entitiesCount={entitiesCount} />
      <WaiterBoardFilters activeTab={activeTab} setActiveTab={setActiveTab} />
      {isLoading ? <WaiterLoadingState /> : null}

      <ul className="space-y-4">
        {isTablesTab(activeTab)
          ? sortedTableReports.map((report) => (
              <WaiterOrderCard
                key={report.tableId}
                nowTimestamp={nowTimestamp}
                onCloseBill={onCloseBill}
                onMarkServed={onMarkServed}
                pendingServeItemIds={servingItemIds}
                report={report}
                updatingTableIds={updatingTableIds}
              />
            ))
          : sortedCompletedOrders.map((order) => (
              <WaiterCompletedOrderCard key={order.id} order={order} onOpenDetails={onOpenClosedOrderDetails} />
            ))}
      </ul>

      {!isLoading && entitiesCount === 0 ? <WaiterEmptyState /> : null}
      <WaiterClosedOrderDetailsModal
        details={selectedClosedOrderDetails}
        errorMessage={selectedClosedOrderError}
        isLoading={isClosedOrderLoading}
        onClose={onCloseClosedOrderDetails}
      />
    </main>
  );
}

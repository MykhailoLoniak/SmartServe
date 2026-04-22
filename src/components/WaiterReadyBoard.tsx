"use client";

import { useState, useTransition } from "react";

import { closeTableBill, type WaiterTableReport } from "@/app/actions/waiterReportActions";

import { WaiterBoardFilters } from "./waiter-board/components/WaiterBoardFilters";
import { WaiterBoardHeader } from "./waiter-board/components/WaiterBoardHeader";
import { WaiterCompletedOrderCard } from "./waiter-board/components/WaiterCompletedOrderCard";
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
  const [, startTransition] = useTransition();
  const { nowTimestamp } = useWaiterTimers();
  const { completedOrders, isLoading, tableReports } = useWaiterRealtime({ initialTables, refreshIntervalMs, restaurantId });
  const { activeTab, entitiesCount, setActiveTab, sortedCompletedOrders, sortedTableReports } = useWaiterFilters({
    completedOrders,
    tableReports,
  });

  const onCloseBill = (tableId: number) => {
    setUpdatingTableIds((previous) => [...previous, tableId]);

    startTransition(async () => {
      try {
        await closeTableBill(tableId, restaurantId);
      } catch (error) {
        console.error("Failed to close table bill", error);
      } finally {
        setUpdatingTableIds((previous) => previous.filter((id) => id !== tableId));
      }
    });
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
                report={report}
                updatingTableIds={updatingTableIds}
              />
            ))
          : sortedCompletedOrders.map((order) => <WaiterCompletedOrderCard key={order.id} order={order} />)}
      </ul>

      {!isLoading && entitiesCount === 0 ? <WaiterEmptyState /> : null}
    </main>
  );
}

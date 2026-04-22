import { useMemo, useState } from "react";

import type { ActiveKitchenOrder } from "@/app/actions/getActiveOrders";
import type { WaiterTableReport } from "@/app/actions/waiterReportActions";

import { isTablesTab, type WaiterTab } from "../helpers/waiterBoardFilters";
import { sortCompletedOrdersByTimeDesc, sortTableReportsByNumber } from "../helpers/waiterBoardSorting";

export const useWaiterFilters = ({
  completedOrders,
  tableReports,
}: {
  completedOrders: ActiveKitchenOrder[];
  tableReports: WaiterTableReport[];
}) => {
  const [activeTab, setActiveTab] = useState<WaiterTab>("tables");

  const sortedTableReports = useMemo(() => sortTableReportsByNumber(tableReports), [tableReports]);
  const sortedCompletedOrders = useMemo(() => sortCompletedOrdersByTimeDesc(completedOrders), [completedOrders]);
  const entitiesCount = isTablesTab(activeTab) ? sortedTableReports.length : sortedCompletedOrders.length;

  return {
    activeTab,
    entitiesCount,
    setActiveTab,
    sortedCompletedOrders,
    sortedTableReports,
  };
};

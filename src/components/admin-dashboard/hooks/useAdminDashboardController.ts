import { useState, useTransition } from "react";

import type { PublicError } from "@/lib/errors";

import type { AdminDashboardRealtimeProps, OrderViewTab, TabKey } from "../types";
import { useKitchenOrdersRealtime } from "./controller/useKitchenOrdersRealtime";
import { useManagerStats } from "./controller/useManagerStats";
import { useMenuManagement } from "./controller/useMenuManagement";
import { useTableManagement } from "./controller/useTableManagement";

export const useAdminDashboardController = ({
  restaurantId,
  initialCookingItems,
  initialMenuItems,
  categories,
  initialActiveOrders,
  initialCompletedOrders,
  initialTables,
  initialManagerStats,
}: AdminDashboardRealtimeProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>("orders");
  const [orderViewTab, setOrderViewTab] = useState<OrderViewTab>("active");
  const [errorMessage, setErrorMessage] = useState<PublicError | null>(null);
  const [isPending, startTransition] = useTransition();

  const runTransition = (task: () => Promise<void>) => {
    startTransition(() => {
      void task();
    });
  };

  const { activeOrders, completedOrders, tables, rowsWithDelay, setTables } = useKitchenOrdersRealtime({
    restaurantId,
    initialCookingItems,
    initialActiveOrders,
    initialCompletedOrders,
    initialTables,
  });

  const {
    formState,
    categoryFilter,
    availabilityFilter,
    filteredMenuItems,
    setFormState,
    setCategoryFilter,
    setAvailabilityFilter,
    setEditMode,
    resetForm,
    onSubmitMenuForm,
    onToggleAvailability,
    onDeleteMenuItem,
  } = useMenuManagement({
    categories,
    initialMenuItems,
    restaurantId,
    setErrorMessage,
    onEnterMenuTab: () => setActiveTab("menu"),
    runTransition,
  });

  const { newTableNumber, setNewTableNumber, onCreateTable, onDeleteTable } = useTableManagement({
    restaurantId,
    setErrorMessage,
    setTables,
    runTransition,
  });

  const { managerPeriod, managerStats, onManagerPeriodChange } = useManagerStats({
    initialManagerStats,
    restaurantId,
    setErrorMessage,
    runTransition,
  });

  return {
    state: {
      activeTab,
      orderViewTab,
      activeOrders,
      completedOrders,
      rowsWithDelay,
      formState,
      categoryFilter,
      availabilityFilter,
      filteredMenuItems,
      managerPeriod,
      managerStats,
      tables,
      newTableNumber,
      errorMessage,
      isPending,
    },
    actions: {
      setActiveTab,
      setOrderViewTab,
      setFormState,
      setCategoryFilter,
      setAvailabilityFilter,
      setNewTableNumber,
      setEditMode,
      resetForm,
      onSubmitMenuForm,
      onToggleAvailability,
      onDeleteMenuItem,
      onCreateTable,
      onDeleteTable,
      onManagerPeriodChange,
    },
  };
};

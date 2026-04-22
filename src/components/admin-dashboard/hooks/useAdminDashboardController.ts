import { useEffect, useMemo, useState, useTransition } from "react";

import {
  createMenuItem,
  createTable,
  deleteMenuItem,
  deleteTable,
  getCookingItems,
  getManagerStats,
  getTablesSnapshot,
  toggleMenuItemAvailability,
  type DashboardMenuItem,
  updateMenuItem,
  type ManagerPeriod,
} from "@/app/actions/adminDashboardActions";
import { getActiveOrders } from "@/app/actions/getActiveOrders";
import { toPublicError, type PublicError } from "@/lib/errors";
import { subscribeToKitchenOrderChanges } from "@/lib/supabase-browser";

import { menuItemFormSchema } from "../schemas/menuItemFormSchema";
import type { AdminDashboardRealtimeProps, OrderViewTab, TabKey } from "../types";
import { createEmptyMenuForm } from "../utils";

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
  const [cookingItems, setCookingItems] = useState(initialCookingItems);
  const [activeOrders, setActiveOrders] = useState(initialActiveOrders);
  const [completedOrders, setCompletedOrders] = useState(initialCompletedOrders);
  const [menuItems, setMenuItems] = useState(initialMenuItems);
  const [tables, setTables] = useState(initialTables);
  const [newTableNumber, setNewTableNumber] = useState("");
  const [managerPeriod, setManagerPeriod] = useState<ManagerPeriod>("today");
  const [managerStats, setManagerStats] = useState(initialManagerStats);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<"all" | "available" | "blocked">("all");
  const [formState, setFormState] = useState(() => createEmptyMenuForm(categories[0]?.id));
  const [errorMessage, setErrorMessage] = useState<PublicError | null>(null);
  const [isPending, startTransition] = useTransition();
  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    setCookingItems(initialCookingItems);
    setActiveOrders(initialActiveOrders);
    setCompletedOrders(initialCompletedOrders);
  }, [initialActiveOrders, initialCompletedOrders, initialCookingItems]);

  useEffect(() => setMenuItems(initialMenuItems), [initialMenuItems]);
  useEffect(() => setTables(initialTables), [initialTables]);
  useEffect(() => setManagerStats(initialManagerStats), [initialManagerStats]);

  useEffect(() => {
    const tickId = window.setInterval(() => setNowMs(Date.now()), 30_000);
    return () => window.clearInterval(tickId);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const refreshKitchenData = async () => {
      try {
        const [items, nextActiveOrders, nextCompletedOrders, nextTables] = await Promise.all([
          getCookingItems(restaurantId),
          getActiveOrders({ statuses: ["PENDING", "COOKING"], mode: "active", restaurantId }),
          getActiveOrders({ statuses: ["PAID"], mode: "completed", restaurantId }),
          getTablesSnapshot(restaurantId),
        ]);

        if (!isMounted) {
          return;
        }

        setCookingItems(items);
        setActiveOrders(nextActiveOrders);
        setCompletedOrders(nextCompletedOrders);
        setTables(nextTables);
      } catch (error) {
        console.error("Failed to refresh kitchen items", error);
      }
    };

    const subscription = subscribeToKitchenOrderChanges({
      onChange: () => {
        void refreshKitchenData();
      },
    });

    const intervalId = window.setInterval(() => {
      void refreshKitchenData();
    }, 20_000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      subscription?.unsubscribe();
    };
  }, [restaurantId]);

  const rowsWithDelay = useMemo(
    () =>
      cookingItems.map((item) => {
        const elapsedMinutes = item.startedAt ? Math.max(0, Math.floor((nowMs - new Date(item.startedAt).getTime()) / 60000)) : 0;
        return {
          ...item,
          elapsedMinutes,
          critical: elapsedMinutes >= item.estimatedTime + 5,
        };
      }),
    [cookingItems, nowMs],
  );

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (categoryFilter !== "all" && String(item.categoryId) !== categoryFilter) {
        return false;
      }

      if (availabilityFilter === "available") {
        return item.isAvailable;
      }

      if (availabilityFilter === "blocked") {
        return !item.isAvailable;
      }

      return true;
    });
  }, [availabilityFilter, categoryFilter, menuItems]);

  const resetForm = () => {
    setFormState(createEmptyMenuForm(categories[0]?.id));
    setErrorMessage(null);
  };

  const setEditMode = (item: DashboardMenuItem) => {
    setFormState({
      id: String(item.id),
      name: item.name,
      description: item.description ?? "",
      price: String(item.price),
      categoryId: String(item.categoryId),
      estimatedTime: String(item.estimatedTime),
    });
    setErrorMessage(null);
    setActiveTab("menu");
  };

  const onSubmitMenuForm = () => {
    setErrorMessage(null);

    const validationResult = menuItemFormSchema.safeParse(formState);
    if (!validationResult.success) {
      setErrorMessage({
        type: "validation",
        message: validationResult.error.issues[0]?.message ?? "Форма містить помилки.",
      });
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        if (formState.id) {
          formData.set("id", formState.id);
        }

        formData.set("name", validationResult.data.name);
        formData.set("description", validationResult.data.description);
        formData.set("price", String(validationResult.data.price));
        formData.set("categoryId", String(validationResult.data.categoryId));
        formData.set("estimatedTime", String(validationResult.data.estimatedTime));

        const nextMenuItems = formState.id
          ? await updateMenuItem(formData, restaurantId)
          : await createMenuItem(formData, restaurantId);

        setMenuItems(nextMenuItems);
        resetForm();
      } catch (error) {
        setErrorMessage(toPublicError(error, "Помилка збереження страви."));
      }
    });
  };

  const onToggleAvailability = (item: DashboardMenuItem) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("id", String(item.id));
        formData.set("isAvailable", String(!item.isAvailable));
        setMenuItems(await toggleMenuItemAvailability(formData, restaurantId));
      } catch (error) {
        setErrorMessage(toPublicError(error, "Не вдалося змінити стоп-лист."));
      }
    });
  };

  const onDeleteMenuItem = (id: number) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("id", String(id));
        setMenuItems(await deleteMenuItem(formData, restaurantId));
      } catch (error) {
        setErrorMessage(toPublicError(error, "Не вдалося видалити страву."));
      }
    });
  };

  const onCreateTable = () => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("number", newTableNumber);
        setTables(await createTable(formData, restaurantId));
        setNewTableNumber("");
        setErrorMessage(null);
      } catch (error) {
        setErrorMessage(toPublicError(error, "Не вдалося додати столик."));
      }
    });
  };

  const onDeleteTable = (tableId: number, activeOrdersCount: number) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("tableId", String(tableId));

        if (activeOrdersCount > 0) {
          const confirmed = window.confirm("Столик зайнятий активними замовленнями. Видалити примусово?");
          if (!confirmed) {
            return;
          }
          formData.set("forceDelete", "true");
        }

        setTables(await deleteTable(formData, restaurantId));
        setErrorMessage(null);
      } catch (error) {
        setErrorMessage(toPublicError(error, "Не вдалося видалити столик."));
      }
    });
  };

  const onManagerPeriodChange = (period: ManagerPeriod) => {
    setManagerPeriod(period);

    startTransition(async () => {
      try {
        setManagerStats(await getManagerStats(period, restaurantId));
      } catch (error) {
        setErrorMessage(toPublicError(error, "Не вдалося завантажити статистику."));
      }
    });
  };

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

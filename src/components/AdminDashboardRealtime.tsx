"use client";

import { AdminTabs } from "./admin-dashboard/AdminTabs";
import { useAdminDashboardController } from "./admin-dashboard/hooks/useAdminDashboardController";
import { MenuSection } from "./admin-dashboard/sections/MenuSection";
import { OrdersSection } from "./admin-dashboard/sections/OrdersSection";
import { StatsSection } from "./admin-dashboard/sections/StatsSection";
import { TablesSection } from "./admin-dashboard/sections/TablesSection";
import type { AdminDashboardRealtimeProps } from "./admin-dashboard/types";

export default function AdminDashboardRealtime(props: AdminDashboardRealtimeProps) {
  const { state, actions } = useAdminDashboardController(props);

  return (
    <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <AdminTabs activeTab={state.activeTab} onChange={actions.setActiveTab} />

      {state.activeTab === "orders" ? (
        <OrdersSection
          orderViewTab={state.orderViewTab}
          activeOrders={state.activeOrders}
          completedOrders={state.completedOrders}
          rowsWithDelay={state.rowsWithDelay}
          onOrderViewTabChange={actions.setOrderViewTab}
        />
      ) : null}

      {state.activeTab === "menu" ? (
        <MenuSection
          categories={state.categories}
          formState={state.formState}
          quickCategoryName={state.quickCategoryName}
          categoryFilter={state.categoryFilter}
          availabilityFilter={state.availabilityFilter}
          filteredMenuItems={state.filteredMenuItems}
          errorMessage={state.errorMessage}
          isPending={state.isPending}
          onFormChange={actions.setFormState}
          onQuickCategoryNameChange={actions.setQuickCategoryName}
          onQuickCreateCategory={() => actions.onCreateCategory(state.quickCategoryName)}
          onCreateCategory={actions.onCreateCategory}
          onRenameCategory={actions.onRenameCategory}
          onDeleteCategory={actions.onDeleteCategory}
          onCategoryFilterChange={actions.setCategoryFilter}
          onAvailabilityFilterChange={actions.setAvailabilityFilter}
          onSubmit={actions.onSubmitMenuForm}
          onReset={actions.resetForm}
          onToggleAvailability={actions.onToggleAvailability}
          onEdit={actions.setEditMode}
          onDelete={actions.onDeleteMenuItem}
        />
      ) : null}

      {state.activeTab === "stats" ? (
        <StatsSection
          managerPeriod={state.managerPeriod}
          managerStats={state.managerStats}
          onPeriodChange={actions.onManagerPeriodChange}
        />
      ) : null}

      {state.activeTab === "tables" ? (
        <TablesSection
          tables={state.tables}
          newTableNumber={state.newTableNumber}
          onTableNumberChange={actions.setNewTableNumber}
          onCreateTable={actions.onCreateTable}
          onDeleteTable={actions.onDeleteTable}
        />
      ) : null}
    </section>
  );
}

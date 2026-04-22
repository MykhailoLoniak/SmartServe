import { requireScopedRestaurantPermission } from "@/lib/restaurantScope";

import { OwnerDashboardStats } from "./_components/OwnerDashboardStats";
import { OwnerMenuSection } from "./_components/OwnerMenuSection";
import { OwnerOrdersSection } from "./_components/OwnerOrdersSection";
import { OwnerSalesSection } from "./_components/OwnerSalesSection";
import { fetchOwnerDashboardData } from "./_lib/ownerDashboardQueries";
import { getOwnerDashboardStats } from "./_lib/ownerDashboardStats";

type OwnerCabinetPageProps = {
  restaurantId?: number;
};

export default async function OwnerCabinetPage({ restaurantId: scopedRestaurantId }: OwnerCabinetPageProps = {}) {
  const restaurantId = await requireScopedRestaurantPermission("view_dashboard", scopedRestaurantId);
  const dashboardData = await fetchOwnerDashboardData(restaurantId);

  const { paidOrdersCount, paidRevenueTotal, salesRows, menuSummary } = getOwnerDashboardStats({
    paidOrdersToday: dashboardData.paidOrdersToday,
    menuItems: dashboardData.menuItems,
  });

  return (
    <main className="min-h-screen bg-[#f7f7f8] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-black">Кабінет власника</h1>
          <p className="mt-2 text-black/60">Огляд меню, процесу замовлень та продажів за сьогодні.</p>
        </header>

        <OwnerDashboardStats
          activeOrdersCount={dashboardData.activeOrders.length}
          completedOrdersCount={dashboardData.completedOrders.length}
          menuSummary={menuSummary}
        />

        <OwnerOrdersSection activeOrders={dashboardData.activeOrders} completedOrders={dashboardData.completedOrders} />
        <OwnerMenuSection menuItems={dashboardData.menuItems} />

        <OwnerSalesSection paidOrdersCount={paidOrdersCount} paidRevenueTotal={paidRevenueTotal} salesRows={salesRows} />
      </div>
    </main>
  );
}

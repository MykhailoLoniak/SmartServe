import { requireAnyPermission } from "@/lib/auth";
import { getActiveRestaurant } from "@/lib/restaurantContext";

import { CreateRestaurantSection } from "./_components/CreateRestaurantSection";
import { RestaurantListSection } from "./_components/RestaurantListSection";
import { RestaurantsPageHeader } from "./_components/RestaurantsPageHeader";
import { getRestaurantDashboardLinks } from "./_lib/restaurantDashboardLinks";

export default async function RestaurantsManagementPage() {
  await requireAnyPermission("view_dashboard");

  const { restaurants, selectedRestaurant, selectedRestaurantId } = await getActiveRestaurant();
  const links = getRestaurantDashboardLinks(selectedRestaurant?.slug ?? null);

  return (
    <main className="min-h-screen bg-[#f7f7f8] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <RestaurantsPageHeader links={links} />
        <RestaurantListSection restaurants={restaurants} selectedRestaurantId={selectedRestaurantId} />
        <CreateRestaurantSection />
      </div>
    </main>
  );
}

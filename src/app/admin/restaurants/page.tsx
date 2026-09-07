import { getActiveRestaurant } from "@/lib/restaurantContext";
import { getAuthSession, requireAnyPermission } from "@/lib/auth";
import { redirect } from "next/navigation";

import { CreateRestaurantSection } from "./_components/CreateRestaurantSection";
import { RestaurantListSection } from "./_components/RestaurantListSection";
import { RestaurantsPageHeader } from "./_components/RestaurantsPageHeader";
import { getRestaurantDashboardLinks } from "./_lib/restaurantDashboardLinks";


export default async function RestaurantsManagementPage() {
  const session = await getAuthSession();

  if (!session) {
    redirect(`/login?next=${encodeURIComponent("/admin/restaurants")}`);
  }

  await requireAnyPermission("view_dashboard");

  const { restaurants, selectedRestaurant, selectedRestaurantId } = await getActiveRestaurant();
  const links = getRestaurantDashboardLinks(selectedRestaurant?.slug ?? null);
  const canCreateRestaurant = session.memberships.some((membership) => membership.role === "OWNER");

  return (
    <main className="min-h-screen bg-[#f7f7f8] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <RestaurantsPageHeader links={links} />
        <RestaurantListSection restaurants={restaurants} selectedRestaurantId={selectedRestaurantId} />
        {canCreateRestaurant ? <CreateRestaurantSection /> : null}
      </div>
    </main>
  );
}

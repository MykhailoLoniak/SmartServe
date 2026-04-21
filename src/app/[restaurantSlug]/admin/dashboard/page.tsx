import AdminDashboardPage from "@/app/admin/dashboard/page";
import { requireRestaurantPermissionForSlug } from "@/lib/restaurantContext";

type Props = { params: Promise<{ restaurantSlug: string }> };

export default async function RestaurantAdminDashboardPage({ params }: Props) {
  const { restaurantSlug } = await params;
  const { restaurantId } = await requireRestaurantPermissionForSlug(restaurantSlug, "view_dashboard");

  return <AdminDashboardPage restaurantId={restaurantId} />;
}

import AdminDashboardPage from "@/app/admin/dashboard/page";
import { requireRestaurantPermissionBySlug } from "@/lib/auth";

type Props = { params: Promise<{ restaurantSlug: string }> };

export default async function RestaurantAdminDashboardPage({ params }: Props) {
  const { restaurantSlug } = await params;
  await requireRestaurantPermissionBySlug(restaurantSlug, "view_dashboard");

  return <AdminDashboardPage />;
}

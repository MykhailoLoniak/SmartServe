import AdminDashboardPage from "@/app/admin/dashboard/page";
import { requireRestaurantAccessBySlug } from "@/lib/auth";

type Props = { params: Promise<{ restaurantSlug: string }> };

export default async function RestaurantAdminDashboardPage({ params }: Props) {
  const { restaurantSlug } = await params;
  await requireRestaurantAccessBySlug(restaurantSlug, ["ADMIN"]);

  return <AdminDashboardPage />;
}

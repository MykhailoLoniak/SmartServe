import OwnerCabinetPage from "@/app/admin/owner/page";
import { requireRestaurantPermissionBySlug } from "@/lib/auth";

type Props = { params: Promise<{ restaurantSlug: string }> };

export default async function RestaurantOwnerPage({ params }: Props) {
  const { restaurantSlug } = await params;
  await requireRestaurantPermissionBySlug(restaurantSlug, "view_dashboard");

  return <OwnerCabinetPage />;
}

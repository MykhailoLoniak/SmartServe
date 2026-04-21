import OwnerCabinetPage from "@/app/admin/owner/page";
import { requireRestaurantPermissionForSlug } from "@/lib/restaurantContext";

type Props = { params: Promise<{ restaurantSlug: string }> };

export default async function RestaurantOwnerPage({ params }: Props) {
  const { restaurantSlug } = await params;
  const { restaurantId } = await requireRestaurantPermissionForSlug(restaurantSlug, "view_dashboard");

  return <OwnerCabinetPage restaurantId={restaurantId} />;
}

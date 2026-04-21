import KitchenPage from "@/app/staff/kitchen/page";
import { requireRestaurantPermissionForSlug } from "@/lib/restaurantContext";

type Props = { params: Promise<{ restaurantSlug: string }> };

export default async function RestaurantKitchenPage({ params }: Props) {
  const { restaurantSlug } = await params;
  const { restaurantId } = await requireRestaurantPermissionForSlug(restaurantSlug, "update_kitchen_status");

  return <KitchenPage restaurantId={restaurantId} />;
}

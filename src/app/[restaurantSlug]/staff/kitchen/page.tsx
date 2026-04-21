import KitchenPage from "@/app/staff/kitchen/page";
import { requireRestaurantPermissionBySlug } from "@/lib/auth";

type Props = { params: Promise<{ restaurantSlug: string }> };

export default async function RestaurantKitchenPage({ params }: Props) {
  const { restaurantSlug } = await params;
  await requireRestaurantPermissionBySlug(restaurantSlug, "update_kitchen_status");

  return <KitchenPage />;
}

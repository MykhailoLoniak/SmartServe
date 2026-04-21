import WaiterPage from "@/app/staff/waiter/page";
import { requireRestaurantPermissionForSlug } from "@/lib/restaurantContext";

type Props = { params: Promise<{ restaurantSlug: string }> };

export default async function RestaurantWaiterPage({ params }: Props) {
  const { restaurantSlug } = await params;
  const { restaurantId } = await requireRestaurantPermissionForSlug(restaurantSlug, "close_bill");

  return <WaiterPage restaurantId={restaurantId} />;
}

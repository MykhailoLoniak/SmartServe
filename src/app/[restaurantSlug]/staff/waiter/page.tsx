import WaiterPage from "@/app/staff/waiter/page";
import { requireRestaurantPermissionBySlug } from "@/lib/auth";

type Props = { params: Promise<{ restaurantSlug: string }> };

export default async function RestaurantWaiterPage({ params }: Props) {
  const { restaurantSlug } = await params;
  await requireRestaurantPermissionBySlug(restaurantSlug, "close_bill");

  return <WaiterPage />;
}

import WaiterPage from "@/app/staff/waiter/page";
import { requireRestaurantAccessBySlug } from "@/lib/auth";

type Props = { params: Promise<{ restaurantSlug: string }> };

export default async function RestaurantWaiterPage({ params }: Props) {
  const { restaurantSlug } = await params;
  await requireRestaurantAccessBySlug(restaurantSlug, ["STAFF", "ADMIN"]);

  return <WaiterPage />;
}

import KitchenPage from "@/app/staff/kitchen/page";
import { requireRestaurantAccessBySlug } from "@/lib/auth";

type Props = { params: Promise<{ restaurantSlug: string }> };

export default async function RestaurantKitchenPage({ params }: Props) {
  const { restaurantSlug } = await params;
  await requireRestaurantAccessBySlug(restaurantSlug, ["STAFF", "ADMIN"]);

  return <KitchenPage />;
}

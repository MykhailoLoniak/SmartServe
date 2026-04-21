import OwnerCabinetPage from "@/app/admin/owner/page";
import { requireRestaurantAccessBySlug } from "@/lib/auth";

type Props = { params: Promise<{ restaurantSlug: string }> };

export default async function RestaurantOwnerPage({ params }: Props) {
  const { restaurantSlug } = await params;
  await requireRestaurantAccessBySlug(restaurantSlug, ["ADMIN"]);

  return <OwnerCabinetPage />;
}

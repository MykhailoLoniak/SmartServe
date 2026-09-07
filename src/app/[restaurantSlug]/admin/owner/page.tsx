import OwnerCabinetPage from "@/app/admin/owner/page";
import { requireRole } from "@/lib/auth";
import { requireRestaurantPermissionForSlug } from "@/lib/restaurantContext";

type Props = { params: Promise<{ restaurantSlug: string }> };

export default async function RestaurantOwnerPage({ params }: Props) {
  const { restaurantSlug } = await params;
  const { restaurantId } = await requireRestaurantPermissionForSlug(restaurantSlug, "view_dashboard");
  await requireRole(restaurantId, ["OWNER"]);

  return <OwnerCabinetPage restaurantId={restaurantId} />;
}

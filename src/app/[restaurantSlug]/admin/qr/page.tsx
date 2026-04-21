import AdminQrPage from "@/app/admin/qr/page";
import { requireRestaurantPermissionForSlug } from "@/lib/restaurantContext";

type Props = { params: Promise<{ restaurantSlug: string }> };

export default async function RestaurantAdminQrPage({ params }: Props) {
  const { restaurantSlug } = await params;
  const { restaurantId } = await requireRestaurantPermissionForSlug(restaurantSlug, "manage_qr");

  return <AdminQrPage restaurantId={restaurantId} />;
}

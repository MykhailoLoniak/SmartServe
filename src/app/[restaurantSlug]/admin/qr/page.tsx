import AdminQrPage from "@/app/admin/qr/page";
import { requireRestaurantPermissionBySlug } from "@/lib/auth";

type Props = { params: Promise<{ restaurantSlug: string }> };

export default async function RestaurantAdminQrPage({ params }: Props) {
  const { restaurantSlug } = await params;
  await requireRestaurantPermissionBySlug(restaurantSlug, "manage_qr");

  return <AdminQrPage />;
}

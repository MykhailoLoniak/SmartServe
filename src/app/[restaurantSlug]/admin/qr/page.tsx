import AdminQrPage from "@/app/admin/qr/page";
import { requireRestaurantAccessBySlug } from "@/lib/auth";

type Props = { params: Promise<{ restaurantSlug: string }> };

export default async function RestaurantAdminQrPage({ params }: Props) {
  const { restaurantSlug } = await params;
  await requireRestaurantAccessBySlug(restaurantSlug, ["ADMIN"]);

  return <AdminQrPage />;
}

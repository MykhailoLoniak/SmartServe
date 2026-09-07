import Link from "next/link";

import AdminQrGenerator from "@/components/AdminQrGenerator";
import { prisma } from "@/lib/prisma";
import { requireScopedRestaurantPermission } from "@/lib/restaurantScope";

type AdminQrPageProps = {
  restaurantId?: number;
};

export default async function AdminQrPage({ restaurantId: scopedRestaurantId }: AdminQrPageProps = {}) {
  const restaurantId = await requireScopedRestaurantPermission("manage_qr", scopedRestaurantId);
  const [restaurant, tables] = await Promise.all([
    prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { slug: true },
    }),
    prisma.table.findMany({
      where: { restaurantId },
      orderBy: [{ number: "asc" }],
      select: {
        id: true,
        number: true,
        qrSlug: true,
      },
    }),
  ]);

  if (!restaurant) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f7f7f8] px-4 py-10 md:px-8">
      {!scopedRestaurantId ? (
        <div className="mx-auto mb-4 max-w-2xl">
          <Link
            href="/admin/restaurants"
            className="inline-flex rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-medium text-black"
          >
            Змінити активний ресторан
          </Link>
        </div>
      ) : null}
      {tables.length > 0 ? (
        <AdminQrGenerator tables={tables} restaurantSlug={restaurant.slug} appUrlFromEnv={process.env.NEXT_PUBLIC_APP_URL} />
      ) : (
        <main className="mx-auto max-w-2xl rounded-3xl border border-black/10 bg-white p-6 text-center shadow-sm md:p-8">
          <h1 className="text-2xl font-bold text-black md:text-3xl">QR-генератор для столиків</h1>
          <p className="mt-3 text-black/60">У базі даних поки немає жодного столика.</p>
        </main>
      )}
    </div>
  );
}

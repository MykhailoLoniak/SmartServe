import Link from "next/link";

import AdminDashboardRealtime from "@/components/AdminDashboardRealtime";
import { getCookingItems, getManagerStats, getTablesSnapshot } from "@/app/actions/adminDashboardActions";
import { getActiveOrders } from "@/app/actions/getActiveOrders";
import { prisma } from "@/lib/prisma";
import { requireRestaurantId } from "@/lib/restaurantContext";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    maximumFractionDigits: 2,
  }).format(amount);

export default async function AdminDashboardPage() {
  const restaurantId = await requireRestaurantId();
  const [categories, menuItems, cookingItems, activeOrders, completedOrders, tables, managerStats] = await Promise.all([
    prisma.category.findMany({
      where: { restaurantId },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    }),
    prisma.menuItem.findMany({
      where: {
        category: {
          restaurantId,
        },
      },
      orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        estimatedTime: true,
        isAvailable: true,
        categoryId: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    }),
    getCookingItems(),
    getActiveOrders({ statuses: ["PENDING", "COOKING"], mode: "active" }),
    getActiveOrders({ statuses: ["PAID"], mode: "completed" }),
    getTablesSnapshot(),
    getManagerStats("today"),
  ]);

  return (
    <main className="min-h-screen bg-[#f7f7f8] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-black">Панель менеджера</h1>
          <p className="mt-2 text-black/60">
            Керування меню, live-моніторинг кухні, столиками та статистикою по періодах.
          </p>
          <Link
            href="/admin/restaurants"
            className="mt-4 inline-flex rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-medium text-black"
          >
            Змінити активний ресторан
          </Link>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-xl border border-black/10 bg-white p-5 shadow-sm">
            <p className="text-sm text-black/60">Оплачених замовлень (сьогодні)</p>
            <p className="mt-2 text-3xl font-bold text-black">{managerStats.ordersCount}</p>
          </article>
          <article className="rounded-xl border border-black/10 bg-white p-5 shadow-sm">
            <p className="text-sm text-black/60">Виручка (сьогодні)</p>
            <p className="mt-2 text-3xl font-bold text-black">{formatCurrency(managerStats.revenue)}</p>
          </article>
        </section>

        <AdminDashboardRealtime
          categories={categories}
          initialMenuItems={menuItems.map((item) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: Number(item.price),
            estimatedTime: item.estimatedTime,
            isAvailable: item.isAvailable,
            categoryId: item.categoryId,
            categoryName: item.category.name,
          }))}
          initialCookingItems={cookingItems}
          initialActiveOrders={activeOrders}
          initialCompletedOrders={completedOrders}
          initialTables={tables}
          initialManagerStats={managerStats}
        />
      </div>
    </main>
  );
}

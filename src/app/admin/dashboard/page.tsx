import AdminDashboardRealtime from "@/components/AdminDashboardRealtime";
import { getCookingItems } from "@/app/actions/adminDashboardActions";
import { getActiveOrders } from "@/app/actions/getActiveOrders";
import { prisma } from "@/lib/prisma";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    maximumFractionDigits: 2,
  }).format(amount);

export default async function AdminDashboardPage() {
  const [categories, menuItems, cookingItems, activeOrders, completedOrders] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    }),
    prisma.menuItem.findMany({
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
  ]);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const shiftOrders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: startOfToday,
      },
    },
    select: {
      totalPrice: true,
    },
  });

  const totalRevenue = shiftOrders.reduce((sum, order) => sum + Number(order.totalPrice), 0);

  return (
    <main className="min-h-screen bg-[#f7f7f8] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-black">Панель менеджера</h1>
          <p className="mt-2 text-black/60">
            Керування меню, live-моніторинг кухні через Supabase Realtime та фінанси зміни.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-xl border border-black/10 bg-white p-5 shadow-sm">
            <p className="text-sm text-black/60">Замовлень за зміну (сьогодні)</p>
            <p className="mt-2 text-3xl font-bold text-black">{shiftOrders.length}</p>
          </article>
          <article className="rounded-xl border border-black/10 bg-white p-5 shadow-sm">
            <p className="text-sm text-black/60">Сума за зміну</p>
            <p className="mt-2 text-3xl font-bold text-black">{formatCurrency(totalRevenue)}</p>
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
          shiftStats={{
            ordersCount: shiftOrders.length,
            totalRevenue,
          }}
          initialActiveOrders={activeOrders}
          initialCompletedOrders={completedOrders}
        />
      </div>
    </main>
  );
}

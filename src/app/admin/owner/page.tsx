import { getActiveOrders } from "@/app/actions/getActiveOrders";
import { prisma } from "@/lib/prisma";
import { requireRestaurantPermission } from "@/lib/restaurantContext";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    maximumFractionDigits: 2,
  }).format(amount);

const formatOrderTime = (createdAt: string) =>
  new Date(createdAt).toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
  });

type OwnerCabinetPageProps = {
  restaurantId?: number;
};

export default async function OwnerCabinetPage({ restaurantId: scopedRestaurantId }: OwnerCabinetPageProps = {}) {
  const restaurantId = scopedRestaurantId ?? (await requireRestaurantPermission("view_dashboard"));
  const [menuItems, activeOrders, completedOrders] = await Promise.all([
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
        price: true,
        isAvailable: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    }),
    getActiveOrders({ statuses: ["PENDING", "COOKING", "READY"], mode: "active", restaurantId }),
    getActiveOrders({ statuses: ["PAID"], mode: "completed", restaurantId }),
  ]);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const paidOrdersToday = await prisma.order.findMany({
    where: {
      status: "PAID",
      table: {
        restaurantId,
      },
      createdAt: {
        gte: startOfToday,
      },
    },
    select: {
      id: true,
      totalPrice: true,
      items: {
        select: {
          quantity: true,
          priceAtTime: true,
          menuItem: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  const salesByDish = new Map<string, { name: string; quantity: number; revenue: number }>();

  paidOrdersToday.forEach((order) => {
    order.items.forEach((item) => {
      const key = String(item.menuItem.id);
      const current = salesByDish.get(key) ?? {
        name: item.menuItem.name,
        quantity: 0,
        revenue: 0,
      };

      current.quantity += item.quantity;
      current.revenue += Number(item.priceAtTime) * item.quantity;
      salesByDish.set(key, current);
    });
  });

  const salesRows = [...salesByDish.values()].sort((a, b) => b.revenue - a.revenue);
  const paidOrdersCount = paidOrdersToday.length;
  const paidRevenueTotal = paidOrdersToday.reduce((sum, order) => sum + Number(order.totalPrice), 0);

  return (
    <main className="min-h-screen bg-[#f7f7f8] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-black">Кабінет власника</h1>
          <p className="mt-2 text-black/60">Огляд меню, процесу замовлень та продажів за сьогодні.</p>
        </header>

        <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-black">Процес замовлень</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <article>
              <h3 className="mb-2 text-sm font-semibold uppercase text-black/60">Активні</h3>
              <ul className="space-y-2">
                {activeOrders.map((order) => (
                  <li key={order.id} className="rounded-2xl border border-black/10 bg-[#f7f7f8] p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <p className="font-semibold">Замовлення #{order.id}</p>
                      <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold uppercase text-white">
                        Стіл №{order.tableNumber}
                      </span>
                    </div>
                    <p className="text-xs text-black/60">Час: {formatOrderTime(order.createdAt)}</p>
                  </li>
                ))}
                {activeOrders.length === 0 ? <p className="text-sm text-black/60">Усі замовлення видані. Чудова робота!</p> : null}
              </ul>
            </article>
            <article>
              <h3 className="mb-2 text-sm font-semibold uppercase text-black/60">Завершені</h3>
              <ul className="space-y-2">
                {completedOrders.map((order) => (
                  <li key={order.id} className="rounded-2xl border border-black/10 bg-[#f7f7f8] p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <p className="font-semibold">Замовлення #{order.id}</p>
                      <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold uppercase text-white">
                        Стіл №{order.tableNumber}
                      </span>
                    </div>
                    <p className="text-xs text-black/60">Фінальний час: {formatOrderTime(order.createdAt)}</p>
                  </li>
                ))}
                {completedOrders.length === 0 ? <p className="text-sm text-black/60">Завершених замовлень ще немає.</p> : null}
              </ul>
            </article>
          </div>
        </section>

        <section className="rounded-xl border border-black/10 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-black">Список страв</h2>
          {menuItems.length === 0 ? (
            <p className="mt-3 text-black/60">Страви ще не додані.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {menuItems.map((item) => (
                <li key={item.id} className="rounded-xl border border-black/10 bg-[#f7f7f8] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-black">{item.name}</p>
                      <p className="text-sm text-black/60">Категорія: {item.category.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-black">{formatCurrency(Number(item.price))}</p>
                      <p className="text-xs text-black/60">{item.isAvailable ? "Доступна" : "Недоступна"}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-black/10 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-black">Звітність про продажі (сьогодні)</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <article className="rounded-xl border border-black/10 bg-[#f7f7f8] p-4">
              <p className="text-sm text-black/60">Оплачених замовлень</p>
              <p className="mt-2 text-2xl font-bold text-black">{paidOrdersCount}</p>
            </article>
            <article className="rounded-xl border border-black/10 bg-[#f7f7f8] p-4">
              <p className="text-sm text-black/60">Виручка</p>
              <p className="mt-2 text-2xl font-bold text-black">{formatCurrency(paidRevenueTotal)}</p>
            </article>
          </div>

          {salesRows.length === 0 ? (
            <p className="mt-4 text-black/60">Сьогодні ще немає продажів.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {salesRows.map((row) => (
                <li key={row.name} className="flex items-center justify-between rounded-xl border border-black/10 bg-[#f7f7f8] p-4">
                  <p className="font-medium text-black">{row.name}</p>
                  <p className="text-sm text-black/70">
                    {row.quantity} шт. · {formatCurrency(row.revenue)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

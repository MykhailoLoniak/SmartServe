import { prisma } from "@/lib/prisma";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    maximumFractionDigits: 2,
  }).format(amount);

export default async function AdminDashboardPage() {
  const activeOrders = await prisma.order.findMany({
    where: {
      status: {
        in: ["PENDING", "COOKING", "READY"],
      },
    },
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      status: true,
      totalPrice: true,
      createdAt: true,
      table: {
        select: {
          number: true,
        },
      },
      items: {
        select: {
          quantity: true,
        },
      },
    },
  });

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const todayOrders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: startOfToday,
      },
    },
    select: {
      totalPrice: true,
    },
  });

  const todayOrdersCount = todayOrders.length;
  const todayRevenue = todayOrders.reduce((sum, order) => sum + Number(order.totalPrice), 0);

  return (
    <main className="min-h-screen bg-[#f7f7f8] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-black">Панель менеджера</h1>
          <p className="mt-2 text-black/60">Огляд активних замовлень та статистики за сьогодні.</p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-xl border border-black/10 bg-white p-5 shadow-sm">
            <p className="text-sm text-black/60">Замовлень за сьогодні</p>
            <p className="mt-2 text-3xl font-bold text-black">{todayOrdersCount}</p>
          </article>
          <article className="rounded-xl border border-black/10 bg-white p-5 shadow-sm">
            <p className="text-sm text-black/60">Сума за сьогодні</p>
            <p className="mt-2 text-3xl font-bold text-black">{formatCurrency(todayRevenue)}</p>
          </article>
        </section>

        <section className="rounded-xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-black">Активні замовлення</h2>
            <span className="rounded-full bg-black/5 px-3 py-1 text-sm text-black">{activeOrders.length}</span>
          </div>

          {activeOrders.length === 0 ? (
            <p className="text-black/60">Зараз немає активних замовлень.</p>
          ) : (
            <ul className="space-y-3">
              {activeOrders.map((order) => (
                <li key={order.id} className="rounded-xl border border-black/10 bg-[#f7f7f8] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-semibold text-black">
                      Замовлення #{order.id} · Стіл #{order.table.number}
                    </p>
                    <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                      {order.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-black/60">
                    Позицій: {order.items.reduce((count, item) => count + item.quantity, 0)} · Сума: {formatCurrency(Number(order.totalPrice))}
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

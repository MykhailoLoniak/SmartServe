import { redirect } from "next/navigation";

import CartFloatingButton from "@/components/CartFloatingButton";
import MenuItemCard from "@/components/MenuItemCard";
import TableIdSync from "@/components/TableIdSync";
import { prisma } from "@/lib/prisma";

type TablePageProps = {
  params: Promise<{ restaurantSlug: string; id: string }>;
};

export default async function RestaurantTablePage({ params }: TablePageProps) {
  const { restaurantSlug, id } = await params;
  const tableId = Number(id);
  const isValidTableId = Number.isInteger(tableId) && tableId > 0;

  if (!isValidTableId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f8] px-4 text-center">
        <div>
          <h1 className="text-2xl font-bold text-black">Некоректний номер столика</h1>
          <p className="mt-2 text-black/60">Перевірте QR-код або посилання та спробуйте ще раз.</p>
        </div>
      </div>
    );
  }

  const table = await prisma.table.findUnique({
    where: { id: tableId },
    select: {
      id: true,
      number: true,
      restaurantId: true,
      restaurant: {
        select: {
          slug: true,
        },
      },
    },
  });

  if (!table) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f8] px-4 text-center">
        <div>
          <h1 className="text-2xl font-bold text-black">Столик не знайдено</h1>
          <p className="mt-2 text-black/60">Цей QR-код більше неактивний або веде на неіснуючий столик.</p>
        </div>
      </div>
    );
  }

  if (table.restaurant.slug !== restaurantSlug) {
    redirect(`/${table.restaurant.slug}/table/${table.id}`);
  }

  const categories = await prisma.category.findMany({
    where: { restaurantId: table.restaurantId },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      menuItems: {
        where: { isAvailable: true },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-[#f7f7f8] px-4 py-10 md:px-8">
      <TableIdSync tableId={table.id} />

      <main className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-black">Меню · Стіл #{table.number}</h1>
        <p className="mt-2 text-black/60">Оберіть страви та додайте їх у кошик.</p>

        <div className="mt-8 space-y-8">
          {categories.map((category) => (
            <section key={category.id}>
              <h2 className="text-2xl font-semibold text-black">{category.name}</h2>

              {category.menuItems.length === 0 ? (
                <p className="mt-3 text-sm text-black/60">У цій категорії поки немає доступних страв.</p>
              ) : (
                <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {category.menuItems.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={{
                        id: item.id,
                        name: item.name,
                        description: item.description,
                        price: Number(item.price),
                      }}
                    />
                  ))}
                </div>
              )}
            </section>
          ))}

          {categories.length === 0 ? <p className="text-black/60">Меню ще не налаштоване для цього закладу.</p> : null}
        </div>
      </main>

      <CartFloatingButton />
    </div>
  );
}

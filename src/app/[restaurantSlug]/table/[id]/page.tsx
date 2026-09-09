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
  const tableToken = id;
  const isValidTableToken = tableToken.length >= 20 && tableToken.length <= 128;

  if (!isValidTableToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f8] px-4 text-center">
        <div>
          <h1 className="text-2xl font-bold text-black">Invalid table reference</h1>
          <p className="mt-2 text-black/60">Check the QR code or link and try again.</p>
        </div>
      </div>
    );
  }

  const table = await prisma.table.findUnique({
    where: { qrSlug: tableToken },
    select: {
      id: true,
      number: true,
      restaurantId: true,
      qrSlug: true,
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
          <h1 className="text-2xl font-bold text-black">Table not found</h1>
          <p className="mt-2 text-black/60">This QR code is inactive or points to a table that does not exist.</p>
        </div>
      </div>
    );
  }

  if (table.restaurant.slug !== restaurantSlug) {
    redirect(`/${table.restaurant.slug}/table/${table.qrSlug}`);
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
      <TableIdSync tableId={table.id} tableToken={table.qrSlug} />

      <main className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-black">Menu · Table #{table.number}</h1>
        <p className="mt-2 text-black/60">Choose menu items and add them to your cart.</p>

        <div className="mt-8 space-y-8">
          {categories.map((category) => (
            <section key={category.id}>
              <h2 className="text-2xl font-semibold text-black">{category.name}</h2>

              {category.menuItems.length === 0 ? (
                <p className="mt-3 text-sm text-black/60">There are no available items in this category yet.</p>
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

          {categories.length === 0 ? <p className="text-black/60">The menu has not been configured for this restaurant yet.</p> : null}
        </div>
      </main>

      <CartFloatingButton />
    </div>
  );
}

import CartFloatingButton from "@/components/CartFloatingButton";
import MenuItemCard from "@/components/MenuItemCard";
import TableIdSync from "@/components/TableIdSync";

const menuItems = [
  {
    id: "1",
    name: "Борщ з пампушками",
    description: "Класичний борщ зі сметаною та часниковими пампушками.",
    price: "145.50",
  },
  {
    id: "2",
    name: "Паста Карбонара",
    description: "Паста al dente з беконом, вершковим соусом та пармезаном.",
    price: "210.00",
  },
  {
    id: "3",
    name: "Сирники",
    description: "Ніжні сирники з ягідним соусом та цукровою пудрою.",
    price: "130.25",
  },
];

type TablePageProps = {
  params: Promise<{ id: string }>;
};

export default async function TablePage({ params }: TablePageProps) {
  const { id } = await params;
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

  return (
    <div className="min-h-screen bg-[#f7f7f8] px-4 py-10 md:px-8">
      <TableIdSync tableId={tableId} />

      <main className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-black">Меню · Стіл #{tableId}</h1>
        <p className="mt-2 text-black/60">Оберіть страви та додайте їх у кошик.</p>

        <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {menuItems.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </section>
      </main>

      <CartFloatingButton />
    </div>
  );
}

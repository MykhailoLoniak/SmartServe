import { formatCurrency } from "../_lib/ownerDashboardFormatters";

type NumericLike = number | string | { valueOf(): unknown };

type OwnerMenuSectionProps = {
  menuItems: Array<{
    id: number;
    name: string;
    price: NumericLike;
    isAvailable: boolean;
    category: {
      name: string;
    };
  }>;
};

export function OwnerMenuSection({ menuItems }: OwnerMenuSectionProps) {
  return (
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
  );
}

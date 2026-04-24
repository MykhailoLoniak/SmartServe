import type { DashboardMenuItem } from "@/app/actions/adminDashboardActions";

import { formatCurrency } from "../utils";

type MenuItemsTableProps = {
  items: DashboardMenuItem[];
  onToggleAvailability: (item: DashboardMenuItem) => void;
  onEdit: (item: DashboardMenuItem) => void;
  onDelete: (id: number) => void;
};

export const MenuItemsTable = ({ items, onToggleAvailability, onEdit, onDelete }: MenuItemsTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-black/10 text-left text-black/60">
            <th className="px-3 py-2">Страва</th>
            <th className="px-3 py-2">Категорія</th>
            <th className="px-3 py-2">Ціна</th>
            <th className="px-3 py-2">Час</th>
            <th className="px-3 py-2">Подача</th>
            <th className="px-3 py-2">Стоп-лист</th>
            <th className="px-3 py-2">Дії</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-black/5">
              <td className="px-3 py-2">
                <p className="font-medium">{item.name}</p>
                {item.description ? <p className="text-xs text-black/60">{item.description}</p> : null}
              </td>
              <td className="px-3 py-2">{item.categoryName}</td>
              <td className="px-3 py-2">{formatCurrency(item.price)}</td>
              <td className="px-3 py-2">{item.estimatedTime} хв</td>
              <td className="px-3 py-2">{item.requiresKitchen ? "Кухня" : "Без кухні"}</td>
              <td className="px-3 py-2">
                <button
                  type="button"
                  onClick={() => onToggleAvailability(item)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${item.isAvailable ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                >
                  {item.isAvailable ? "У меню" : "Стоп-лист"}
                </button>
              </td>
              <td className="px-3 py-2">
                <div className="flex gap-2">
                  <button type="button" onClick={() => onEdit(item)} className="rounded bg-black/10 px-2 py-1 text-xs">
                    Редагувати
                  </button>
                  <button type="button" onClick={() => onDelete(item.id)} className="rounded bg-red-100 px-2 py-1 text-xs text-red-700">
                    Видалити
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

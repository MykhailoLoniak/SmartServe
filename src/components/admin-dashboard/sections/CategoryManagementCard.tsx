import { useState } from "react";

import type { DashboardCategory } from "../types";

type CategoryManagementCardProps = {
  categories: DashboardCategory[];
  isPending: boolean;
  onCreateCategory: (name: string) => void;
  onRenameCategory: (id: number, name: string) => void;
  onDeleteCategory: (id: number) => void;
};

export const CategoryManagementCard = ({
  categories,
  isPending,
  onCreateCategory,
  onRenameCategory,
  onDeleteCategory,
}: CategoryManagementCardProps) => {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [renameDrafts, setRenameDrafts] = useState<Record<number, string>>({});

  return (
    <div className="space-y-3 rounded-xl border border-black/10 bg-[#f7f7f8] p-4">
      <h3 className="text-sm font-semibold text-black">Керування категоріями</h3>

      <div className="flex gap-2">
        <input
          value={newCategoryName}
          onChange={(event) => setNewCategoryName(event.target.value)}
          className="w-full rounded-lg border border-black/20 bg-white px-3 py-2 text-sm"
          placeholder="Нова категорія"
        />
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            onCreateCategory(newCategoryName);
            setNewCategoryName("");
          }}
          className="rounded-lg bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Додати
        </button>
      </div>

      <div className="space-y-2">
        {categories.map((category) => {
          const draft = renameDrafts[category.id] ?? category.name;

          return (
            <div key={category.id} className="flex items-center gap-2">
              <input
                value={draft}
                onChange={(event) =>
                  setRenameDrafts((previous) => ({
                    ...previous,
                    [category.id]: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-black/20 bg-white px-3 py-2 text-sm"
              />
              <button
                type="button"
                disabled={isPending}
                onClick={() => onRenameCategory(category.id, draft)}
                className="rounded-lg bg-black/10 px-3 py-2 text-sm font-medium text-black disabled:opacity-50"
              >
                Зберегти
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => onDeleteCategory(category.id)}
                className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 disabled:opacity-50"
              >
                Видалити
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

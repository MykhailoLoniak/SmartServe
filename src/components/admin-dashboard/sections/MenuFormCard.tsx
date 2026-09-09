import type { MenuFormState, DashboardCategory } from "../types";

type MenuFormCardProps = {
  categories: DashboardCategory[];
  formState: MenuFormState;
  isPending: boolean;
  quickCategoryName: string;
  onQuickCategoryNameChange: (value: string) => void;
  onQuickCreateCategory: () => void;
  onFormChange: (updater: (prev: MenuFormState) => MenuFormState) => void;
  onSubmit: () => void;
  onReset: () => void;
};

export const MenuFormCard = ({
  categories,
  formState,
  isPending,
  quickCategoryName,
  onQuickCategoryNameChange,
  onQuickCreateCategory,
  onFormChange,
  onSubmit,
  onReset,
}: MenuFormCardProps) => {
  return (
    <div className="grid gap-3 rounded-xl border border-black/10 bg-[#f7f7f8] p-4 md:grid-cols-2">
      <label className="text-sm text-black/70">
        Menu item name
        <input
          value={formState.name}
          onChange={(event) => onFormChange((previous) => ({ ...previous, name: event.target.value }))}
          className="mt-1 w-full rounded-lg border border-black/20 bg-white px-3 py-2 outline-none focus:border-black"
          placeholder="For example: Borscht"
        />
      </label>

      <label className="text-sm text-black/70">
        Price (UAH)
        <input
          type="number"
          min="1"
          step="0.01"
          value={formState.price}
          onChange={(event) => onFormChange((previous) => ({ ...previous, price: event.target.value }))}
          className="mt-1 w-full rounded-lg border border-black/20 bg-white px-3 py-2 outline-none focus:border-black"
        />
      </label>

      <label className="text-sm text-black/70">
        Category
        <select
          value={formState.categoryId}
          onChange={(event) => onFormChange((previous) => ({ ...previous, categoryId: event.target.value }))}
          className="mt-1 w-full rounded-lg border border-black/20 bg-white px-3 py-2 outline-none focus:border-black"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <div className="mt-2 flex gap-2">
          <input
            value={quickCategoryName}
            onChange={(event) => onQuickCategoryNameChange(event.target.value)}
            className="w-full rounded-lg border border-black/20 bg-white px-3 py-2 text-sm outline-none focus:border-black"
            placeholder="Quickly add a category"
          />
          <button
            type="button"
            onClick={onQuickCreateCategory}
            disabled={isPending}
            className="rounded-lg bg-black/10 px-3 py-2 text-sm font-medium text-black disabled:opacity-50"
          >
            + Category
          </button>
        </div>
      </label>

      <label className="text-sm text-black/70">
        Estimated time (min)
        <input
          type="number"
          min="1"
          value={formState.estimatedTime}
          onChange={(event) => onFormChange((previous) => ({ ...previous, estimatedTime: event.target.value }))}
          className="mt-1 w-full rounded-lg border border-black/20 bg-white px-3 py-2 outline-none focus:border-black"
        />
      </label>

      <label className="text-sm text-black/70 md:col-span-2">
        Description
        <textarea
          value={formState.description}
          onChange={(event) => onFormChange((previous) => ({ ...previous, description: event.target.value }))}
          rows={3}
          className="mt-1 w-full rounded-lg border border-black/20 bg-white px-3 py-2 outline-none focus:border-black"
        />
      </label>

      <label className="md:col-span-2 flex items-center gap-2 text-sm text-black/70">
        <input
          type="checkbox"
          checked={formState.requiresKitchen}
          onChange={(event) => onFormChange((previous) => ({ ...previous, requiresKitchen: event.target.checked }))}
          className="h-4 w-4 rounded border border-black/20"
        />
        Requires kitchen preparation
      </label>

      <div className="flex gap-2 md:col-span-2">
        <button type="button" onClick={onSubmit} disabled={isPending} className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
          {formState.id ? "Update menu item" : "Add menu item"}
        </button>
        <button type="button" onClick={onReset} disabled={isPending} className="rounded-lg bg-black/10 px-4 py-2 text-sm font-medium text-black disabled:opacity-50">
          Clear form
        </button>
      </div>
    </div>
  );
};

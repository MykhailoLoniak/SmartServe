import type { DashboardMenuItem } from "@/app/actions/adminDashboardActions";
import type { PublicError } from "@/lib/errors";

import type { DashboardCategory, MenuFormState } from "../types";
import { CategoryManagementCard } from "./CategoryManagementCard";
import { MenuFormCard } from "./MenuFormCard";
import { MenuItemsTable } from "./MenuItemsTable";

type MenuSectionProps = {
  categories: DashboardCategory[];
  formState: MenuFormState;
  categoryFilter: string;
  availabilityFilter: "all" | "available" | "blocked";
  filteredMenuItems: DashboardMenuItem[];
  errorMessage: PublicError | null;
  isPending: boolean;
  quickCategoryName: string;
  onFormChange: (updater: (prev: MenuFormState) => MenuFormState) => void;
  onQuickCategoryNameChange: (value: string) => void;
  onQuickCreateCategory: () => void;
  onCreateCategory: (name: string) => void;
  onRenameCategory: (id: number, name: string) => void;
  onDeleteCategory: (id: number) => void;
  onCategoryFilterChange: (value: string) => void;
  onAvailabilityFilterChange: (value: "all" | "available" | "blocked") => void;
  onSubmit: () => void;
  onReset: () => void;
  onToggleAvailability: (item: DashboardMenuItem) => void;
  onEdit: (item: DashboardMenuItem) => void;
  onDelete: (id: number) => void;
};

export const MenuSection = ({
  categories,
  formState,
  categoryFilter,
  availabilityFilter,
  filteredMenuItems,
  errorMessage,
  isPending,
  quickCategoryName,
  onFormChange,
  onQuickCategoryNameChange,
  onQuickCreateCategory,
  onCreateCategory,
  onRenameCategory,
  onDeleteCategory,
  onCategoryFilterChange,
  onAvailabilityFilterChange,
  onSubmit,
  onReset,
  onToggleAvailability,
  onEdit,
  onDelete,
}: MenuSectionProps) => {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-black">Menu editor</h2>
        <p className="text-sm text-black/60">Add and edit menu items and manage availability in real time.</p>
      </div>

      <MenuFormCard
        categories={categories}
        formState={formState}
        isPending={isPending}
        quickCategoryName={quickCategoryName}
        onQuickCategoryNameChange={onQuickCategoryNameChange}
        onQuickCreateCategory={onQuickCreateCategory}
        onFormChange={onFormChange}
        onSubmit={onSubmit}
        onReset={onReset}
      />

      <CategoryManagementCard
        categories={categories}
        isPending={isPending}
        onCreateCategory={onCreateCategory}
        onRenameCategory={onRenameCategory}
        onDeleteCategory={onDeleteCategory}
      />

      {errorMessage ? (
        <p className="text-sm text-red-600" data-error-type={errorMessage.type}>
          {errorMessage.message}
        </p>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm text-black/70">
          Filter by category
          <select
            value={categoryFilter}
            onChange={(event) => onCategoryFilterChange(event.target.value)}
            className="mt-1 w-full rounded-lg border border-black/20 px-3 py-2"
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm text-black/70">
          Filter by availability
          <select
            value={availabilityFilter}
            onChange={(event) => onAvailabilityFilterChange(event.target.value as "all" | "available" | "blocked")}
            className="mt-1 w-full rounded-lg border border-black/20 px-3 py-2"
          >
            <option value="all">All</option>
            <option value="available">Available only</option>
            <option value="blocked">Unavailable only</option>
          </select>
        </label>
      </div>

      <MenuItemsTable items={filteredMenuItems} onToggleAvailability={onToggleAvailability} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
};

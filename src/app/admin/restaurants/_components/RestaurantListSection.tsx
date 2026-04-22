import type { RestaurantListItem } from "../_lib/types";
import { RestaurantCard } from "./RestaurantCard";
import { SectionCard } from "./SectionCard";

type RestaurantListSectionProps = {
  restaurants: RestaurantListItem[];
  selectedRestaurantId: number | null;
};

export function RestaurantListSection({ restaurants, selectedRestaurantId }: RestaurantListSectionProps) {
  return (
    <SectionCard title="Список ресторанів">
      {restaurants.length === 0 ? (
        <p className="mt-3 text-black/60">Поки що немає жодного ресторану. Створи перший заклад нижче.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {restaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              isActive={restaurant.id === selectedRestaurantId}
              canDelete={restaurants.length > 1}
            />
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

import { getMutedTextClassName, getRestaurantCardClassName } from "../_lib/restaurantCardStyles";
import type { RestaurantListItem } from "../_lib/types";
import { RestaurantActions } from "./RestaurantActions";
import { RestaurantEditForm } from "./RestaurantEditForm";
import { RestaurantStatusBadge } from "./RestaurantStatusBadge";

type RestaurantCardProps = {
  restaurant: RestaurantListItem;
  isActive: boolean;
  canDelete: boolean;
};

export function RestaurantCard({ restaurant, isActive, canDelete }: RestaurantCardProps) {
  return (
    <li className={getRestaurantCardClassName(isActive)}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold">{restaurant.name}</p>
            <p className={`text-sm ${getMutedTextClassName(isActive)}`}>slug: {restaurant.slug}</p>
          </div>
          {isActive ? (
            <RestaurantStatusBadge />
          ) : (
            <RestaurantActions type="activate" isActive={isActive} restaurantId={restaurant.id} canDelete={canDelete} />
          )}
        </div>

        <RestaurantEditForm restaurant={restaurant} isActive={isActive} />

        <RestaurantActions type="delete" isActive={isActive} restaurantId={restaurant.id} canDelete={canDelete} />
      </div>
    </li>
  );
}

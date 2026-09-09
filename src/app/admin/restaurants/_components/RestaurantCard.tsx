import Link from "next/link";

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

        <Link
          href={`/${restaurant.slug}/admin/dashboard`}
          className={`inline-flex rounded-lg border px-3 py-2 text-sm font-medium ${
            isActive ? "border-white/20 bg-white text-black hover:bg-white/90" : "border-black/10 bg-black text-white hover:bg-black/80"
          }`}
        >
          Manager dashboard
        </Link>

        <RestaurantActions type="delete" isActive={isActive} restaurantId={restaurant.id} canDelete={canDelete} />
      </div>
    </li>
  );
}

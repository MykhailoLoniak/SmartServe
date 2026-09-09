import { updateRestaurant } from "@/app/actions/restaurantManagementActions";

import { getLabelClassName } from "../_lib/restaurantCardStyles";
import { restaurantFormStyles } from "../_lib/restaurantFormStyles";
import type { RestaurantListItem } from "../_lib/types";
import { RestaurantFormFields } from "./RestaurantFormFields";

type RestaurantEditFormProps = {
  restaurant: RestaurantListItem;
  isActive: boolean;
};

export function RestaurantEditForm({ restaurant, isActive }: RestaurantEditFormProps) {
  return (
    <form action={updateRestaurant} className={restaurantFormStyles.editGrid}>
      <input type="hidden" name="restaurantId" value={restaurant.id} />
      <RestaurantFormFields
        labelClassName={`${restaurantFormStyles.labelBase} ${getLabelClassName(isActive)}`}
        defaults={{
          name: restaurant.name,
          slug: restaurant.slug,
          logoUrl: restaurant.logoUrl ?? "",
        }}
      />
      <div className="flex flex-wrap gap-2 md:col-span-3">
        <button type="submit" className={restaurantFormStyles.submitButtonLight}>
          Save
        </button>
      </div>
    </form>
  );
}

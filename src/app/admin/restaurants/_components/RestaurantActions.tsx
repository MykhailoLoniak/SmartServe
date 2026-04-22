import { deleteRestaurant, setActiveRestaurant } from "@/app/actions/restaurantManagementActions";

import { getDeleteButtonClassName, getMutedTextClassName } from "../_lib/restaurantCardStyles";
import { restaurantFormStyles } from "../_lib/restaurantFormStyles";

type RestaurantActionsProps = {
  type: "activate" | "delete";
  isActive: boolean;
  restaurantId: number;
  canDelete: boolean;
};

export function RestaurantActions({ type, isActive, restaurantId, canDelete }: RestaurantActionsProps) {
  if (type === "activate") {
    if (isActive) return null;

    return (
      <form action={setActiveRestaurant}>
        <input type="hidden" name="restaurantId" value={restaurantId} />
        <button type="submit" className={restaurantFormStyles.activateButton}>
          Зробити активним
        </button>
      </form>
    );
  }

  if (!canDelete) {
    return <p className={`text-xs ${getMutedTextClassName(isActive)}`}>Останній ресторан видалити не можна.</p>;
  }

  return (
    <form action={deleteRestaurant}>
      <input type="hidden" name="restaurantId" value={restaurantId} />
      <button type="submit" className={`${restaurantFormStyles.deleteButtonBase} ${getDeleteButtonClassName(isActive)}`}>
        Видалити ресторан
      </button>
    </form>
  );
}

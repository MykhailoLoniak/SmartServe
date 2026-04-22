import { createRestaurant } from "@/app/actions/restaurantManagementActions";

import { restaurantFormStyles } from "../_lib/restaurantFormStyles";
import { RestaurantFormFields } from "./RestaurantFormFields";
import { SectionCard } from "./SectionCard";

export function CreateRestaurantSection() {
  return (
    <SectionCard title="Додати ресторан">
      <form action={createRestaurant} className={restaurantFormStyles.createGrid}>
        <RestaurantFormFields
          labelClassName={restaurantFormStyles.createLabel}
          optionalSlug
          logoColSpanClassName="md:col-span-2"
        />
        <button type="submit" className={restaurantFormStyles.submitButtonDark}>
          Створити ресторан
        </button>
      </form>
    </SectionCard>
  );
}

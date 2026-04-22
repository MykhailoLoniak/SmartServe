import { restaurantFormStyles } from "../_lib/restaurantFormStyles";

type RestaurantFormFieldsProps = {
  labelClassName: string;
  defaults?: {
    name?: string;
    slug?: string;
    logoUrl?: string;
  };
  optionalSlug?: boolean;
  logoColSpanClassName?: string;
};

export function RestaurantFormFields({
  labelClassName,
  defaults,
  optionalSlug = false,
  logoColSpanClassName = "",
}: RestaurantFormFieldsProps) {
  return (
    <>
      <label className={labelClassName}>
        Назва
        <input
          required
          name="name"
          defaultValue={defaults?.name}
          className={restaurantFormStyles.input}
          placeholder={defaults ? undefined : "Наприклад, Gastro Point"}
        />
      </label>

      <label className={labelClassName}>
        Slug{optionalSlug ? " (необов\'язково)" : ""}
        <input
          name="slug"
          required={!optionalSlug}
          defaultValue={defaults?.slug}
          className={restaurantFormStyles.input}
          placeholder={defaults ? undefined : "gastro-point"}
        />
      </label>

      <label className={`${labelClassName} ${logoColSpanClassName}`.trim()}>
        Логотип URL{optionalSlug ? " (необов\'язково)" : ""}
        <input
          name="logoUrl"
          defaultValue={defaults?.logoUrl}
          placeholder="https://..."
          className={restaurantFormStyles.input}
        />
      </label>
    </>
  );
}

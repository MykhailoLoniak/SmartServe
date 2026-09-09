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
        Name
        <input
          required
          name="name"
          defaultValue={defaults?.name}
          className={restaurantFormStyles.input}
          placeholder={defaults ? undefined : "For example, Gastro Point"}
        />
      </label>

      <label className={labelClassName}>
        Slug{optionalSlug ? " (optional)" : ""}
        <input
          name="slug"
          required={!optionalSlug}
          defaultValue={defaults?.slug}
          className={restaurantFormStyles.input}
          placeholder={defaults ? undefined : "gastro-point"}
        />
      </label>

      <label className={`${labelClassName} ${logoColSpanClassName}`.trim()}>
        Logo URL{optionalSlug ? " (optional)" : ""}
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

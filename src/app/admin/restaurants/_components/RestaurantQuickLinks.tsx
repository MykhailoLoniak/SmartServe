import Link from "next/link";

type RestaurantQuickLinksProps = {
  links: {
    dashboardHref: string;
    qrHref: string;
    ownerHref: string;
    kitchenHref: string;
    waiterHref: string;
  };
};

const linkClassName = "rounded-lg border border-black/10 bg-white px-3 py-2 text-black";

export function RestaurantQuickLinks({ links }: RestaurantQuickLinksProps) {
  return (
    <div className="mt-4 flex flex-wrap gap-3 text-sm">
      <Link href={links.dashboardHref} className="rounded-lg border border-black/10 bg-black px-3 py-2 text-white">
        Панель менеджера
      </Link>
      <Link href={links.qrHref} className={linkClassName}>
        До QR-генератора
      </Link>
      <Link href={links.ownerHref} className={linkClassName}>
        Кабінет власника
      </Link>
      <Link href={links.kitchenHref} className={linkClassName}>
        Кухня
      </Link>
      <Link href={links.waiterHref} className={linkClassName}>
        Офіціант
      </Link>
    </div>
  );
}

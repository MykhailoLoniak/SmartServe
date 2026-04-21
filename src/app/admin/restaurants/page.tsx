import Link from "next/link";

import {
  createRestaurant,
  deleteRestaurant,
  setActiveRestaurant,
  updateRestaurant,
} from "@/app/actions/restaurantManagementActions";
import { getActiveRestaurant } from "@/lib/restaurantContext";

export default async function RestaurantsManagementPage() {
  const { restaurants, selectedRestaurantId } = await getActiveRestaurant();

  return (
    <main className="min-h-screen bg-[#f7f7f8] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-black">Керування ресторанами</h1>
          <p className="mt-2 text-black/60">
            Обери активний ресторан для панелі, кухні та офіціантів. Усі дані відображаються тільки в межах обраного
            закладу.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link href="/admin/dashboard" className="rounded-lg border border-black/10 bg-black px-3 py-2 text-white">
              До панелі менеджера
            </Link>
            <Link href="/admin/qr" className="rounded-lg border border-black/10 bg-white px-3 py-2 text-black">
              До QR-генератора
            </Link>
          </div>
        </header>

        <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-black">Список ресторанів</h2>
          {restaurants.length === 0 ? (
            <p className="mt-3 text-black/60">Поки що немає жодного ресторану. Створи перший заклад нижче.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {restaurants.map((restaurant) => {
                const isActive = restaurant.id === selectedRestaurantId;

                return (
                  <li
                    key={restaurant.id}
                    className={`rounded-xl border p-4 ${isActive ? "border-black bg-black/95 text-white" : "border-black/10 bg-[#f7f7f8] text-black"}`}
                  >
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold">{restaurant.name}</p>
                          <p className={`text-sm ${isActive ? "text-white/70" : "text-black/60"}`}>slug: {restaurant.slug}</p>
                        </div>
                        {isActive ? (
                          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase">Активний</span>
                        ) : (
                          <form action={setActiveRestaurant}>
                            <input type="hidden" name="restaurantId" value={restaurant.id} />
                            <button
                              type="submit"
                              className="rounded-lg border border-black/20 bg-white px-3 py-2 text-sm font-medium text-black"
                            >
                              Зробити активним
                            </button>
                          </form>
                        )}
                      </div>

                      <form action={updateRestaurant} className="grid gap-3 md:grid-cols-3">
                        <input type="hidden" name="restaurantId" value={restaurant.id} />

                        <label className={`text-xs font-medium ${isActive ? "text-white/80" : "text-black/70"}`}>
                          Назва
                          <input
                            required
                            name="name"
                            defaultValue={restaurant.name}
                            className="mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-black"
                          />
                        </label>

                        <label className={`text-xs font-medium ${isActive ? "text-white/80" : "text-black/70"}`}>
                          Slug
                          <input
                            required
                            name="slug"
                            defaultValue={restaurant.slug}
                            className="mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-black"
                          />
                        </label>

                        <label className={`text-xs font-medium ${isActive ? "text-white/80" : "text-black/70"}`}>
                          Логотип URL
                          <input
                            name="logoUrl"
                            defaultValue={restaurant.logoUrl ?? ""}
                            placeholder="https://..."
                            className="mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-black"
                          />
                        </label>

                        <div className="flex flex-wrap gap-2 md:col-span-3">
                          <button
                            type="submit"
                            className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-black"
                          >
                            Зберегти
                          </button>
                        </div>
                      </form>

                      {restaurants.length > 1 ? (
                        <form action={deleteRestaurant}>
                          <input type="hidden" name="restaurantId" value={restaurant.id} />
                          <button
                            type="submit"
                            className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                              isActive
                                ? "border-red-300 bg-red-500/20 text-red-100 hover:bg-red-500/30"
                                : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                            }`}
                          >
                            Видалити ресторан
                          </button>
                        </form>
                      ) : (
                        <p className={`text-xs ${isActive ? "text-white/70" : "text-black/60"}`}>
                          Останній ресторан видалити не можна.
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-black">Додати ресторан</h2>
          <form action={createRestaurant} className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="text-sm font-medium text-black">
              Назва
              <input
                required
                name="name"
                className="mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-black"
                placeholder="Наприклад, Gastro Point"
              />
            </label>
            <label className="text-sm font-medium text-black">
              Slug (необов&apos;язково)
              <input
                name="slug"
                className="mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-black"
                placeholder="gastro-point"
              />
            </label>
            <label className="text-sm font-medium text-black md:col-span-2">
              Логотип URL (необов&apos;язково)
              <input
                name="logoUrl"
                className="mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-black"
                placeholder="https://..."
              />
            </label>
            <button
              type="submit"
              className="mt-2 inline-flex w-fit rounded-lg bg-black px-4 py-2 text-sm font-medium text-white md:col-span-2"
            >
              Створити ресторан
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

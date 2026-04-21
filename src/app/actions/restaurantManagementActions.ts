"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { RESTAURANT_COOKIE_KEY } from "@/lib/restaurantContext";

const normalizeSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9а-яіїєґё\-_\s]/gi, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const getRequiredString = (value: FormDataEntryValue | null) => {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

const revalidateRestaurantPages = () => {
  revalidatePath("/admin/restaurants");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/qr");
  revalidatePath("/admin/owner");
  revalidatePath("/staff/kitchen");
  revalidatePath("/staff/waiter");
};

export async function createRestaurant(formData: FormData) {
  const name = getRequiredString(formData.get("name"));
  const slugInput = getRequiredString(formData.get("slug"));
  const logoUrl = getRequiredString(formData.get("logoUrl"));

  if (!name) {
    throw new Error("Вкажіть назву ресторану.");
  }

  const baseSlug = normalizeSlug(slugInput ?? name);
  if (!baseSlug) {
    throw new Error("Слаг має містити літери або цифри.");
  }

  let slugCandidate = baseSlug;
  let suffix = 2;

  while (await prisma.restaurant.findUnique({ where: { slug: slugCandidate }, select: { id: true } })) {
    slugCandidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  const created = await prisma.restaurant.create({
    data: {
      name,
      slug: slugCandidate,
      logoUrl,
    },
    select: { id: true },
  });

  const cookieStore = await cookies();
  cookieStore.set(RESTAURANT_COOKIE_KEY, String(created.id), {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
  });

  revalidateRestaurantPages();
}

export async function setActiveRestaurant(formData: FormData) {
  const idRaw = formData.get("restaurantId");
  const restaurantId = typeof idRaw === "string" ? Number.parseInt(idRaw, 10) : Number.NaN;

  if (!Number.isInteger(restaurantId) || restaurantId <= 0) {
    throw new Error("Некоректний ресторан.");
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { id: true },
  });

  if (!restaurant) {
    throw new Error("Ресторан не знайдено.");
  }

  const cookieStore = await cookies();
  cookieStore.set(RESTAURANT_COOKIE_KEY, String(restaurant.id), {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
  });

  revalidateRestaurantPages();
}

export async function updateRestaurant(formData: FormData) {
  const idRaw = formData.get("restaurantId");
  const restaurantId = typeof idRaw === "string" ? Number.parseInt(idRaw, 10) : Number.NaN;
  const name = getRequiredString(formData.get("name"));
  const slugInput = getRequiredString(formData.get("slug"));
  const logoUrl = getRequiredString(formData.get("logoUrl"));

  if (!Number.isInteger(restaurantId) || restaurantId <= 0) {
    throw new Error("Некоректний ресторан.");
  }

  if (!name) {
    throw new Error("Вкажіть назву ресторану.");
  }

  const slug = normalizeSlug(slugInput ?? "");
  if (!slug) {
    throw new Error("Слаг обовʼязковий і має містити літери або цифри.");
  }

  const duplicateSlug = await prisma.restaurant.findFirst({
    where: {
      slug,
      id: {
        not: restaurantId,
      },
    },
    select: { id: true },
  });

  if (duplicateSlug) {
    throw new Error("Ресторан з таким slug вже існує.");
  }

  await prisma.restaurant.update({
    where: { id: restaurantId },
    data: {
      name,
      slug,
      logoUrl,
    },
  });

  revalidateRestaurantPages();
}

export async function deleteRestaurant(formData: FormData) {
  const idRaw = formData.get("restaurantId");
  const restaurantId = typeof idRaw === "string" ? Number.parseInt(idRaw, 10) : Number.NaN;

  if (!Number.isInteger(restaurantId) || restaurantId <= 0) {
    throw new Error("Некоректний ресторан.");
  }

  const restaurants = await prisma.restaurant.findMany({
    orderBy: { id: "asc" },
    select: { id: true },
  });

  if (restaurants.length <= 1) {
    throw new Error("Неможливо видалити останній ресторан.");
  }

  const restaurantExists = restaurants.some((restaurant) => restaurant.id === restaurantId);
  if (!restaurantExists) {
    throw new Error("Ресторан не знайдено.");
  }

  await prisma.restaurant.delete({
    where: { id: restaurantId },
  });

  const cookieStore = await cookies();
  const activeCookieId = Number.parseInt(cookieStore.get(RESTAURANT_COOKIE_KEY)?.value ?? "", 10);

  if (activeCookieId === restaurantId) {
    const fallbackRestaurant = restaurants.find((restaurant) => restaurant.id !== restaurantId);
    if (fallbackRestaurant) {
      cookieStore.set(RESTAURANT_COOKIE_KEY, String(fallbackRestaurant.id), {
        path: "/",
        sameSite: "lax",
        httpOnly: true,
      });
    }
  }

  revalidateRestaurantPages();
}

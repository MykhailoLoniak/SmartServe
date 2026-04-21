"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { writeAuditLog } from "@/lib/audit";
import { requireAuth, requirePermission, requireRestaurantAccessById } from "@/lib/auth";
import { badRequest } from "@/lib/errors";
import { createRequestId, logEvent } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { RESTAURANT_COOKIE_KEY } from "@/lib/restaurantContext";
import { restaurantSchema } from "@/lib/validation";

const normalizeSlug = (value: string) =>
  value.trim().toLowerCase().replace(/[^a-z0-9а-яіїєґё\-_\s]/gi, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

const getRequiredString = (value: FormDataEntryValue | null) => {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

const revalidateRestaurantPages = () => {
  revalidatePath("/admin/restaurants");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/qr");
};

export async function createRestaurant(formData: FormData) {
  const requestId = createRequestId();
  const session = await requireAuth();
  const name = getRequiredString(formData.get("name"));
  const slugInput = getRequiredString(formData.get("slug"));
  const logoUrl = getRequiredString(formData.get("logoUrl"));
  const baseSlug = normalizeSlug(slugInput ?? name ?? "");

  const parsed = restaurantSchema.safeParse({ name, slug: baseSlug, logoUrl: logoUrl ?? null });
  if (!parsed.success) throw badRequest("Вкажіть коректні дані ресторану", { issues: parsed.error.flatten(), requestId });

  let slugCandidate = parsed.data.slug;
  let suffix = 2;
  while (await prisma.restaurant.findUnique({ where: { slug: slugCandidate }, select: { id: true } })) {
    slugCandidate = `${parsed.data.slug}-${suffix++}`;
  }

  const created = await prisma.restaurant.create({
    data: { name: parsed.data.name, slug: slugCandidate, logoUrl: parsed.data.logoUrl, createdById: session.userId, updatedById: session.userId },
    select: { id: true },
  });

  await prisma.userRestaurantRole.create({ data: { userId: session.userId, restaurantId: created.id, role: "OWNER" } });

  await writeAuditLog({ action: "RESTAURANT_CREATED", userId: session.userId, restaurantId: created.id, entityType: "restaurant", entityId: String(created.id), requestId });
  logEvent("restaurant.create", { requestId, restaurantId: created.id, userId: session.userId });

  const cookieStore = await cookies();
  cookieStore.set(RESTAURANT_COOKIE_KEY, String(created.id), { path: "/", sameSite: "lax", httpOnly: true, secure: process.env.NODE_ENV === "production" });
  revalidateRestaurantPages();
}

export async function setActiveRestaurant(formData: FormData) {
  await requireAuth();
  const restaurantId = Number.parseInt(String(formData.get("restaurantId") ?? ""), 10);
  if (!Number.isInteger(restaurantId) || restaurantId <= 0) throw badRequest("Некоректний ресторан.");
  await requireRestaurantAccessById(restaurantId);
  const cookieStore = await cookies();
  cookieStore.set(RESTAURANT_COOKIE_KEY, String(restaurantId), { path: "/", sameSite: "lax", httpOnly: true, secure: process.env.NODE_ENV === "production" });
  revalidateRestaurantPages();
}

export async function updateRestaurant(formData: FormData) {
  const requestId = createRequestId();
  const session = await requireAuth();
  const restaurantId = Number.parseInt(String(formData.get("restaurantId") ?? ""), 10);
  if (!Number.isInteger(restaurantId) || restaurantId <= 0) throw badRequest("Некоректний ресторан.");
  await requirePermission(restaurantId, "manage_restaurant");
  const name = getRequiredString(formData.get("name"));
  const slug = normalizeSlug(getRequiredString(formData.get("slug")) ?? "");
  const logoUrl = getRequiredString(formData.get("logoUrl"));
  const parsed = restaurantSchema.safeParse({ id: restaurantId, name, slug, logoUrl: logoUrl ?? null });
  if (!parsed.success) throw badRequest("Перевірте дані ресторану", { issues: parsed.error.flatten(), requestId });

  await prisma.restaurant.update({ where: { id: restaurantId }, data: { name: parsed.data.name, slug: parsed.data.slug, logoUrl: parsed.data.logoUrl, updatedById: session.userId } });
  await writeAuditLog({ action: "RESTAURANT_UPDATED", userId: session.userId, restaurantId, entityType: "restaurant", entityId: String(restaurantId), requestId });
  revalidateRestaurantPages();
}

export async function deleteRestaurant(formData: FormData) {
  const requestId = createRequestId();
  const session = await requireAuth();
  const restaurantId = Number.parseInt(String(formData.get("restaurantId") ?? ""), 10);
  if (!Number.isInteger(restaurantId) || restaurantId <= 0) throw badRequest("Некоректний ресторан.");
  await requirePermission(restaurantId, "manage_restaurant");

  await prisma.restaurant.delete({ where: { id: restaurantId } });
  await writeAuditLog({ action: "RESTAURANT_DELETED", userId: session.userId, restaurantId, entityType: "restaurant", entityId: String(restaurantId), requestId });
  revalidateRestaurantPages();
}

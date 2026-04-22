import { revalidatePath } from "next/cache";

export const DASHBOARD_PATH = "/admin/dashboard";
export const QR_PATH = "/admin/qr";
export const DYNAMIC_DASHBOARD_PATH = "/[restaurantSlug]/admin/dashboard";
export const DYNAMIC_QR_PATH = "/[restaurantSlug]/admin/qr";
export const DEFAULT_ESTIMATED_TIME_MINUTES = 15;
export const ACTIVE_ORDER_STATUSES = ["PENDING", "COOKING", "READY"] as const;

export const parseIntField = (value: FormDataEntryValue | null, fallback?: number) => {
  if (typeof value !== "string") {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parsePrice = (value: FormDataEntryValue | null) => {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.replace(",", ".").trim();
  const parsed = Number.parseFloat(normalized);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
};

const getRequiredString = (value: FormDataEntryValue | null) => {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

export const parseMenuItemPayload = (formData: FormData) => {
  const name = getRequiredString(formData.get("name"));
  const descriptionEntry = formData.get("description");
  const description = typeof descriptionEntry === "string" ? descriptionEntry.trim() : "";
  const price = parsePrice(formData.get("price"));
  const categoryId = parseIntField(formData.get("categoryId"));
  const estimatedTime = parseIntField(formData.get("estimatedTime"), DEFAULT_ESTIMATED_TIME_MINUTES);

  return {
    name,
    description: description || null,
    price,
    categoryId,
    estimatedTime,
  };
};

export const revalidateAdminPaths = () => {
  revalidatePath(DASHBOARD_PATH);
  revalidatePath(QR_PATH);
  revalidatePath(DYNAMIC_DASHBOARD_PATH, "page");
  revalidatePath(DYNAMIC_QR_PATH, "page");
};

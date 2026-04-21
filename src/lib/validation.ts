type ParseResult<T> = { success: true; data: T } | { success: false; error: { flatten: () => Record<string, unknown> } };

type UnknownRecord = Record<string, unknown>;

const fail = (issues: unknown): ParseResult<never> => ({ success: false, error: { flatten: () => ({ fieldErrors: issues }) } });
const ok = <T>(data: T): ParseResult<T> => ({ success: true, data });

const asRecord = (input: unknown): UnknownRecord | null => (input && typeof input === "object" ? (input as UnknownRecord) : null);

export const loginSchema = {
  safeParse(input: { email?: string; password?: string }): ParseResult<{ email: string; password: string }> {
    if (!input?.email || !input.email.includes("@") || !input.password || input.password.length < 8) return fail({ login: ["invalid"] });
    return ok({ email: input.email.trim().toLowerCase(), password: input.password });
  },
};

export const createOrderSchema = {
  safeParse(input: unknown): ParseResult<{ tableId: number; items: Array<{ menuItemId: number; quantity: number; course: number }> }> {
    const record = asRecord(input);
    const tableId = record?.tableId;
    const items = record?.items;
    if (!Number.isInteger(tableId) || (tableId as number) <= 0 || !Array.isArray(items) || items.length === 0) return fail({ order: ["invalid"] });
    for (const rawItem of items) {
      const item = asRecord(rawItem);
      if (!item || !Number.isInteger(item.menuItemId) || (item.menuItemId as number) <= 0 || !Number.isInteger(item.quantity) || (item.quantity as number) < 1 || (item.quantity as number) > 100 || !Number.isInteger(item.course) || (item.course as number) < 1 || (item.course as number) > 3) return fail({ items: ["invalid"] });
    }
    return ok({ tableId: tableId as number, items: items as Array<{ menuItemId: number; quantity: number; course: number }> });
  },
};

export const updateOrderStatusSchema = {
  safeParse(input: unknown): ParseResult<{ orderId?: number; orderItemId?: number; status: "PENDING" | "COOKING" | "READY" | "PAID" }> {
    const record = asRecord(input);
    const status = record?.status;
    if (status !== "PENDING" && status !== "COOKING" && status !== "READY" && status !== "PAID") return fail({ status: ["invalid"] });
    if (Number.isInteger(record?.orderId) && (record.orderId as number) > 0) return ok({ orderId: record.orderId as number, status });
    if (Number.isInteger(record?.orderItemId) && (record.orderItemId as number) > 0 && status !== "PAID") return ok({ orderItemId: record.orderItemId as number, status });
    return fail({ target: ["invalid"] });
  },
};

export const closeBillSchema = {
  safeParse(input: unknown): ParseResult<{ tableId: number }> {
    const record = asRecord(input);
    if (!Number.isInteger(record?.tableId) || (record.tableId as number) <= 0) return fail({ tableId: ["invalid"] });
    return ok({ tableId: record.tableId as number });
  },
};

export const restaurantSchema = {
  safeParse(input: unknown): ParseResult<{ id?: number; name: string; slug: string; logoUrl: string | null }> {
    const record = asRecord(input);
    const name = typeof record?.name === "string" ? record.name.trim() : "";
    const slug = typeof record?.slug === "string" ? record.slug.trim() : "";
    if (name.length < 2 || slug.length < 2) return fail({ restaurant: ["invalid"] });
    return ok({ id: typeof record?.id === "number" ? record.id : undefined, name, slug, logoUrl: typeof record?.logoUrl === "string" ? record.logoUrl : null });
  },
};

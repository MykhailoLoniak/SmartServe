import { z } from "zod";

const positiveInt = z.number().int().positive();

export const idSchema = positiveInt;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Некоректний email"),
  password: z.string().min(8, "Пароль має містити щонайменше 8 символів"),
});

export const createOrderItemSchema = z.object({
  menuItemId: positiveInt,
  quantity: z.number().int().min(1).max(100),
  course: z.number().int().min(1).max(3),
});

export const createOrderSchema = z.object({
  tableId: positiveInt,
  items: z.array(createOrderItemSchema).min(1),
});

export const updateOrderStatusSchema = z
  .object({
    orderId: positiveInt.optional(),
    orderItemId: positiveInt.optional(),
    status: z.enum(["PENDING", "COOKING", "READY", "PAID"]),
  })
  .superRefine((input, ctx) => {
    const hasOrder = typeof input.orderId === "number";
    const hasOrderItem = typeof input.orderItemId === "number";

    if (!hasOrder && !hasOrderItem) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["target"], message: "Потрібно передати orderId або orderItemId" });
    }

    if (hasOrder && hasOrderItem) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["target"], message: "Передайте тільки один target" });
    }

    if (hasOrderItem && input.status === "PAID") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["status"], message: "PAID можна виставляти тільки для orderId" });
    }
  });

export const closeBillSchema = z.object({
  tableId: positiveInt,
});

export const restaurantSchema = z.object({
  id: positiveInt.optional(),
  name: z.string().trim().min(2),
  slug: z.string().trim().min(2),
  logoUrl: z.string().url().nullable(),
});

export const menuItemSchema = z.object({
  id: positiveInt.optional(),
  name: z.string().trim().min(2),
  description: z.string().trim().max(1000).nullable(),
  price: z.number().positive(),
  categoryId: positiveInt,
  estimatedTime: z.number().int().min(1).max(180),
  isAvailable: z.boolean().optional(),
});

export const categorySchema = z.object({
  id: positiveInt.optional(),
  name: z.string().trim().min(2),
  restaurantId: positiveInt,
});

export const tableSchema = z.object({
  number: positiveInt,
  tableId: positiveInt.optional(),
  forceDelete: z.boolean().optional(),
});

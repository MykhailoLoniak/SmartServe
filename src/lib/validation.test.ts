import assert from "node:assert/strict";
import test from "node:test";

import { createOrderSchema, loginSchema, updateOrderStatusSchema } from "./validation";

test("login schema validates email/password", () => {
  assert.equal(loginSchema.safeParse({ email: "user@example.com", password: "password123" }).success, true);
  assert.equal(loginSchema.safeParse({ email: "bad", password: "123" }).success, false);
});

test("create order schema validates payload", () => {
  const validOrder = { tableToken: "opaque-table-token-123456", idempotencyKey: "123e4567-e89b-42d3-a456-426614174000", items: [{ menuItemId: 1, quantity: 2, course: 1 }] };
  assert.equal(createOrderSchema.safeParse(validOrder).success, true);
  assert.equal(createOrderSchema.safeParse({ ...validOrder, items: [] }).success, false);
  assert.equal(createOrderSchema.safeParse({ ...validOrder, items: [{ menuItemId: 1, quantity: 21, course: 1 }] }).success, false);
  assert.equal(createOrderSchema.safeParse({ ...validOrder, tableToken: "1" }).success, false);
});

test("order status schema rejects paid update for order item", () => {
  assert.equal(updateOrderStatusSchema.safeParse({ orderItemId: 1, status: "PAID" }).success, false);
  assert.equal(updateOrderStatusSchema.safeParse({ orderId: 1, status: "PAID" }).success, true);
});

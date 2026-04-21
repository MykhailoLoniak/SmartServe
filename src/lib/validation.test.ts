import assert from "node:assert/strict";
import test from "node:test";

import { createOrderSchema, loginSchema, updateOrderStatusSchema } from "./validation";

test("login schema validates email/password", () => {
  assert.equal(loginSchema.safeParse({ email: "user@example.com", password: "password123" }).success, true);
  assert.equal(loginSchema.safeParse({ email: "bad", password: "123" }).success, false);
});

test("create order schema validates payload", () => {
  assert.equal(createOrderSchema.safeParse({ tableId: 1, items: [{ menuItemId: 1, quantity: 2, course: 1 }] }).success, true);
  assert.equal(createOrderSchema.safeParse({ tableId: 0, items: [] }).success, false);
});

test("order status schema rejects paid update for order item", () => {
  assert.equal(updateOrderStatusSchema.safeParse({ orderItemId: 1, status: "PAID" }).success, false);
  assert.equal(updateOrderStatusSchema.safeParse({ orderId: 1, status: "PAID" }).success, true);
});

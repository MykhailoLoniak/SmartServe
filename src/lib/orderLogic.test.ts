import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateOrderTotal,
  canTransitionOrderItemStatus,
  canTransitionOrderStatus,
  deriveOrderStatusByItems,
  hasInProgressItems,
  priceOrderItems,
} from "./orderLogic";

test("priceOrderItems calculates server-side prices only from DB map", () => {
  const priced = priceOrderItems(
    [
      { menuItemId: 1, quantity: 2, course: 1 },
      { menuItemId: 2, quantity: 1, course: 2 },
    ],
    new Map([
      [1, 120],
      [2, 80],
    ]),
  );

  assert.deepEqual(priced, [
    { menuItemId: 1, quantity: 2, course: 1, priceAtTime: 120 },
    { menuItemId: 2, quantity: 1, course: 2, priceAtTime: 80 },
  ]);
  assert.equal(calculateOrderTotal(priced), 320);
});

test("deriveOrderStatusByItems follows pending/cooking/ready flow", () => {
  assert.equal(deriveOrderStatusByItems(["PENDING", "PENDING"]), "PENDING");
  assert.equal(deriveOrderStatusByItems(["COOKING", "PENDING"]), "COOKING");
  assert.equal(deriveOrderStatusByItems(["READY", "READY"]), "READY");
});

test("order-level status transitions only move forward toward payment", () => {
  assert.equal(canTransitionOrderStatus("PENDING", "COOKING"), true);
  assert.equal(canTransitionOrderStatus("COOKING", "READY"), true);
  assert.equal(canTransitionOrderStatus("READY", "PAID"), true);
  assert.equal(canTransitionOrderStatus("PENDING", "READY"), false);
  assert.equal(canTransitionOrderStatus("READY", "COOKING"), false);
  assert.equal(canTransitionOrderStatus("PAID", "READY"), false);
  assert.equal(canTransitionOrderStatus("READY", "SERVED"), false);
});

test("item-level transitions keep kitchen and waiter flows separate", () => {
  assert.equal(canTransitionOrderItemStatus("PENDING", "COOKING"), true);
  assert.equal(canTransitionOrderItemStatus("COOKING", "READY"), true);
  assert.equal(canTransitionOrderItemStatus("READY", "SERVED"), true);
  assert.equal(canTransitionOrderItemStatus("PENDING", "SERVED"), true);
  assert.equal(canTransitionOrderItemStatus("PENDING", "READY"), false);
  assert.equal(canTransitionOrderItemStatus("SERVED", "READY"), false);
  assert.equal(canTransitionOrderItemStatus("SERVED", "PAID"), false);
});

test("hasInProgressItems blocks waiter bill close until all items are SERVED", () => {
  assert.equal(
    hasInProgressItems([
      { items: [{ status: "SERVED" }, { status: "SERVED" }] },
      { items: [{ status: "SERVED" }] },
    ]),
    false,
  );

  assert.equal(
    hasInProgressItems([
      { items: [{ status: "SERVED" }] },
      { items: [{ status: "COOKING" }] },
    ]),
    true,
  );
});

import assert from "node:assert/strict";
import test from "node:test";

import { calculateOrderTotal, deriveOrderStatusByItems, hasInProgressItems, priceOrderItems } from "./orderLogic";

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

test("hasInProgressItems blocks waiter bill close until all items are READY", () => {
  assert.equal(
    hasInProgressItems([
      { items: [{ status: "READY" }, { status: "READY" }] },
      { items: [{ status: "READY" }] },
    ]),
    false,
  );

  assert.equal(
    hasInProgressItems([
      { items: [{ status: "READY" }] },
      { items: [{ status: "COOKING" }] },
    ]),
    true,
  );
});

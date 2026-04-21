import assert from "node:assert/strict";
import test from "node:test";

import { resolveRestaurantIdScope } from "./restaurantScopeCore";

test("slug-scoped restaurant id overrides active restaurant cookie context", () => {
  const resolvedRestaurantId = resolveRestaurantIdScope(1, 2);
  assert.equal(resolvedRestaurantId, 1);
});

test("non-slug flow keeps active restaurant behavior when scoped id is absent", () => {
  const resolvedRestaurantId = resolveRestaurantIdScope(undefined, 2);
  assert.equal(resolvedRestaurantId, 2);
});

test("scoped id remains stable regardless of active cookie selection", () => {
  const withActiveRestaurantA = resolveRestaurantIdScope(7, 7);
  const withActiveRestaurantB = resolveRestaurantIdScope(7, 9);

  assert.equal(withActiveRestaurantA, 7);
  assert.equal(withActiveRestaurantB, 7);
});

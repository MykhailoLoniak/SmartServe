import assert from "node:assert/strict";
import test from "node:test";

import { isAuthorizedRestaurantSlug } from "./accessControl";

test("restaurant access allows wildcard", () => {
  assert.equal(isAuthorizedRestaurantSlug("*", "main-hall"), true);
});

test("restaurant access denies slug outside allowed list", () => {
  assert.equal(isAuthorizedRestaurantSlug(new Set(["main-hall", "vip"]), "other"), false);
});

import assert from "node:assert/strict";
import test from "node:test";

import { isAuthorizedRestaurantSlug, parseAccessList } from "./accessControl";

test("restaurant access allows wildcard", () => {
  assert.equal(isAuthorizedRestaurantSlug("*", "main-hall"), true);
});

test("restaurant access denies slug outside allowed list", () => {
  assert.equal(isAuthorizedRestaurantSlug(new Set(["main-hall", "vip"]), "other"), false);
});

test("forbidden restaurant slug stays forbidden after parsing access list", () => {
  const access = parseAccessList("main-hall,vip-zone");
  assert.equal(isAuthorizedRestaurantSlug(access, "private-room"), false);
});

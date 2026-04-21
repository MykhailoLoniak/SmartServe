import assert from "node:assert/strict";
import test from "node:test";

import { getRolePermissions, hasPermission } from "./permissions";

test("OWNER keeps access to admin permissions", () => {
  assert.equal(hasPermission("OWNER", "manage_qr"), true);
  assert.equal(hasPermission("OWNER", "view_dashboard"), true);
});

test("specialized roles keep specialized permissions", () => {
  assert.equal(hasPermission("KITCHEN", "update_kitchen_status"), true);
  assert.equal(hasPermission("WAITER", "close_bill"), true);
  assert.equal(hasPermission("KITCHEN", "close_bill"), false);
});

test("role permission matrix returns non-empty owner permissions", () => {
  assert.ok(getRolePermissions("OWNER").length > 0);
});

import assert from "node:assert/strict";
import test from "node:test";

import { PERMISSIONS, USER_ROLES, getRolePermissions, hasPermission } from "./permissions";

test("OWNER keeps access to admin permissions", () => {
  assert.equal(hasPermission("OWNER", "manage_qr"), true);
  assert.equal(hasPermission("OWNER", "view_dashboard"), true);
  assert.equal(hasPermission("OWNER", "manage_restaurant"), true);
  assert.equal(hasPermission("ADMIN", "manage_restaurant"), false);
  assert.equal(hasPermission("STAFF", "manage_restaurant"), false);
});

test("specialized roles keep specialized permissions", () => {
  assert.equal(hasPermission("KITCHEN", "update_kitchen_status"), true);
  assert.equal(hasPermission("WAITER", "close_bill"), true);
  assert.equal(hasPermission("KITCHEN", "close_bill"), false);
  assert.equal(hasPermission("KITCHEN", "manage_orders"), false);
  assert.equal(hasPermission("WAITER", "manage_orders"), false);
  assert.equal(hasPermission("STAFF", "update_kitchen_status"), false);
  assert.equal(hasPermission("STAFF", "close_bill"), false);
});

test("role permission matrix returns non-empty owner permissions", () => {
  assert.ok(getRolePermissions("OWNER").length > 0);
});

test("permission mapping keeps OWNER as superset", () => {
  const ownerPermissions = getRolePermissions("OWNER");
  assert.deepEqual(ownerPermissions, [...PERMISSIONS]);
});

test("every role has at least one mapped permission", () => {
  for (const role of USER_ROLES) {
    assert.ok(getRolePermissions(role).length > 0, `${role} must keep at least one permission`);
  }
});

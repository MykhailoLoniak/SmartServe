import assert from "node:assert/strict";
import test from "node:test";

import { getDayRange } from "./dateRanges";

test("day range follows configured timezone in winter", () => {
  const range = getDayRange(new Date("2026-01-15T12:00:00Z"), "Europe/Madrid");
  assert.equal(range.start.toISOString(), "2026-01-14T23:00:00.000Z");
  assert.equal(range.end.toISOString(), "2026-01-15T22:59:59.999Z");
});

test("day range follows daylight-saving timezone in summer", () => {
  const range = getDayRange(new Date("2026-07-15T12:00:00Z"), "Europe/Madrid");
  assert.equal(range.start.toISOString(), "2026-07-14T22:00:00.000Z");
  assert.equal(range.end.toISOString(), "2026-07-15T21:59:59.999Z");
});

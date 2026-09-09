import assert from "node:assert/strict";
import test from "node:test";

import { getWeekLabel, toStatsRows, updateStatsBucket } from "./managerStats";

test("getWeekLabel aligns Sunday to previous Monday", () => {
  const sunday = new Date("2026-04-19T12:00:00.000Z");
  const result = getWeekLabel(sunday);

  assert.equal(result, "Week 4/13/2026");
});

test("updateStatsBucket accumulates orders and revenue", () => {
  const bucket = new Map<string, { ordersCount: number; revenue: number }>();

  updateStatsBucket(bucket, "17.04.2026", 120);
  updateStatsBucket(bucket, "17.04.2026", 80);

  assert.deepEqual(bucket.get("17.04.2026"), { ordersCount: 2, revenue: 200 });
});

test("toStatsRows includes calculated average check", () => {
  const bucket = new Map<string, { ordersCount: number; revenue: number }>([
    ["17.04.2026", { ordersCount: 4, revenue: 500 }],
  ]);

  const [row] = toStatsRows(bucket);
  assert.deepEqual(row, {
    label: "17.04.2026",
    ordersCount: 4,
    revenue: 500,
    averageCheck: 125,
  });
});

import assert from "node:assert/strict";
import test from "node:test";
import { buildAnalyticsSnapshot } from "../lib/analytics.ts";
import type { CodeforcesBundle } from "../lib/types.ts";

const bundle: CodeforcesBundle = {
  user: { handle: "test-user", rating: 1500, maxRating: 1550, rank: "specialist" },
  submissions: [
    { id: 1, creationTimeSeconds: 1_700_000_000, verdict: "WRONG_ANSWER", programmingLanguage: "GNU C++17", problem: { contestId: 1, index: "A", name: "One", rating: 1300, tags: ["binary search"] } },
    { id: 2, creationTimeSeconds: 1_700_000_100, verdict: "OK", programmingLanguage: "GNU C++17", problem: { contestId: 1, index: "A", name: "One", rating: 1300, tags: ["binary search"] } },
    { id: 3, creationTimeSeconds: 1_700_086_400, verdict: "TIME_LIMIT_EXCEEDED", programmingLanguage: "GNU C++17", problem: { contestId: 2, index: "B", name: "Two", rating: 1400, tags: ["binary search"] } },
  ],
  problems: [
    { contestId: 1, index: "A", name: "One", rating: 1300, tags: ["binary search"] },
    { contestId: 2, index: "B", name: "Two", rating: 1400, tags: ["binary search"] },
    { contestId: 3, index: "C", name: "Three", rating: 1400, tags: ["binary search"] },
    { contestId: 4, index: "D", name: "Four", rating: 1500, tags: ["binary search"] },
  ],
};

test("builds summary metrics from problem-level attempts", () => {
  const snapshot = buildAnalyticsSnapshot(bundle);
  assert.equal(snapshot.summary.totalSubmissions, 3);
  assert.equal(snapshot.summary.attempted, 2);
  assert.equal(snapshot.summary.solved, 1);
  assert.equal(snapshot.summary.solveRate, 50);
  assert.equal(snapshot.summary.averageAttempts, 2);
  assert.equal(snapshot.summary.activeDays, 2);
});

test("excludes attempted problems from recommendations", () => {
  const snapshot = buildAnalyticsSnapshot(bundle);
  assert.ok(snapshot.recommendations.length > 0);
  assert.ok(snapshot.recommendations.every((problem) => problem.id !== "1-A" && problem.id !== "2-B"));
  assert.equal(snapshot.recommendations[0]?.primaryTag, "binary search");
});

test("returns a seven-day schedule", () => {
  const snapshot = buildAnalyticsSnapshot(bundle);
  assert.equal(snapshot.schedule.length, 7);
  assert.equal(snapshot.schedule[0]?.label, "Monday");
  assert.equal(snapshot.schedule[6]?.label, "Sunday");
});

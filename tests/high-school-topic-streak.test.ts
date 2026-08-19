import { describe, expect, it } from "vitest";

import { highSchoolWeeklyStreak } from "../lib/high-school-topic-streak";

const now = new Date("2026-08-19T12:00:00.000Z");

describe("Rounds high-school private weekly study streak", () => {
  it("counts one completed topic in each consecutive UTC week as a current private streak", () => {
    const streak = highSchoolWeeklyStreak({ records: [
      { unitId: "biology-living-systems-foundation", outcome: "mastered", completedAt: "2026-08-18T09:00:00.000Z" },
      { unitId: "chemistry-particle-description-foundation", outcome: "review", completedAt: "2026-08-11T09:00:00.000Z" },
      { unitId: "english-main-idea-foundation", outcome: "reflected", completedAt: "2026-08-04T09:00:00.000Z" },
    ], savedUnitIds: [] }, now);
    expect(streak).toMatchObject({ currentWeeks: 3, longestWeeks: 3, activeThisWeek: true });
    expect(streak.nextStep).toContain("This week is active");
  });

  it("does not bridge a missing week and preserves the longest completed rhythm separately", () => {
    const streak = highSchoolWeeklyStreak({ records: [
      { unitId: "biology-living-systems-foundation", outcome: "mastered", completedAt: "2026-08-18T09:00:00.000Z" },
      { unitId: "chemistry-particle-description-foundation", outcome: "review", completedAt: "2026-08-04T09:00:00.000Z" },
      { unitId: "english-main-idea-foundation", outcome: "reflected", completedAt: "2026-07-28T09:00:00.000Z" },
    ], savedUnitIds: [] }, now);
    expect(streak).toMatchObject({ currentWeeks: 1, longestWeeks: 2, activeThisWeek: true });
  });

  it("treats repeated records in one week as one activity, ignores malformed/future dates, and keeps the next step private", () => {
    const streak = highSchoolWeeklyStreak({ records: [
      { unitId: "biology-living-systems-foundation", outcome: "mastered", completedAt: "2026-08-17T00:00:00.000Z" },
      { unitId: "biology-variables-development", outcome: "review", completedAt: "2026-08-23T23:00:00.000Z" },
      { unitId: "english-main-idea-foundation", outcome: "reflected", completedAt: "not-a-date" },
      { unitId: "physics-motion-foundation", outcome: "mastered", completedAt: "2026-09-01T09:00:00.000Z" },
    ], savedUnitIds: [] }, now);
    expect(streak).toMatchObject({ currentWeeks: 1, longestWeeks: 1, activeThisWeek: true, activeWeekStarts: [Date.parse("2026-08-17T00:00:00.000Z")] });
    expect(streak.nextStep).not.toContain("grade");
  });
});

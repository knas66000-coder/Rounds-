import { describe, expect, it } from "vitest";
import { activitiesForCourseRound, courseRoundActivityId, courseRoundSnapshot, parseCourseRoundState, recordCourseRoundOutcome, toggleCourseRoundBookmark } from "../lib/course-round-store";

describe("Rounds shared learning-round state", () => {
  it("keeps queues subject-specific and no-repeat by activity identity", () => {
    const state = parseCourseRoundState(null);
    const foundation = activitiesForCourseRound("university-foundation-year", state);
    expect(foundation.map(courseRoundActivityId)).toEqual(["university-foundation-year:academic-writing", "university-foundation-year:digital-literacy", "university-foundation-year:quantitative-literacy"]);
    expect(new Set(foundation.map(courseRoundActivityId)).size).toBe(foundation.length);
    expect(activitiesForCourseRound("computing-foundations", state).map(courseRoundActivityId)).toEqual(["computing-foundations:computing-logic-trace", "computing-foundations:computing-requirements"]);
  });

  it("persists a bookmark and outcome without leaking the saved activity into another pack", () => {
    const id = "computing-foundations:computing-requirements";
    const state = recordCourseRoundOutcome(toggleCourseRoundBookmark(parseCourseRoundState(null), id), id, "correct", "2026-08-18T00:00:00.000Z");
    expect(courseRoundSnapshot("computing-foundations", state)).toEqual({ completed: 1, correct: 1, review: 0, saved: 1 });
    expect(courseRoundSnapshot("business-foundations", state)).toEqual({ completed: 0, correct: 0, review: 0, saved: 0 });
  });

  it("rejects malformed or unknown stored round records", () => {
    const state = parseCourseRoundState(JSON.stringify({ records: [{ activityId: "nursing-practice:nclex-practice", outcome: "correct", completedAt: "2026-08-18T00:00:00.000Z" }, { activityId: "bad", outcome: "correct", completedAt: "now" }], bookmarks: ["missing:activity", "business-foundations:business-customer-evidence"] }));
    expect(state.records).toEqual([]);
    expect(state.bookmarks).toEqual(["business-foundations:business-customer-evidence"]);
  });
});

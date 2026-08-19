import { describe, expect, it } from "vitest";

import { highSchoolTopicScopeLabel, parseHighSchoolLevel, parseHighSchoolRevisionPlan, parseHighSchoolTopicScope } from "../lib/high-school-store";

describe("Rounds high-school local study state", () => {
  it("uses Senior 1 as the safe local-level fallback and accepts each supported Senior level", () => {
    expect(parseHighSchoolLevel(null)).toBe("s1");
    expect(parseHighSchoolLevel("s6")).toBe("s6");
    expect(parseHighSchoolLevel("university")).toBe("s1");
  });

  it("keeps only reviewed high-school packs in the private local revision plan", () => {
    expect(parseHighSchoolRevisionPlan(JSON.stringify({ focusPackId: "uganda-high-school-ict", weeklyTarget: 4, updatedAt: "2026-08-19T00:00:00.000Z" }))).toEqual({ focusPackId: "uganda-high-school-ict", weeklyTarget: 4, updatedAt: "2026-08-19T00:00:00.000Z" });
    expect(parseHighSchoolRevisionPlan(JSON.stringify({ focusPackId: "nursing-practice", weeklyTarget: 99, updatedAt: "bad" }))).toEqual({ focusPackId: null, weeklyTarget: 3, updatedAt: "bad" });
  });

  it("defaults topic scope to local level-matched study and accepts only the explicit broader option", () => {
    expect(parseHighSchoolTopicScope(null)).toBe("level_matched");
    expect(parseHighSchoolTopicScope("broadened")).toBe("broadened");
    expect(parseHighSchoolTopicScope("all_subjects")).toBe("level_matched");
    expect(highSchoolTopicScopeLabel("level_matched")).toBe("For my level");
  });
});

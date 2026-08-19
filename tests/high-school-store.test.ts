import { describe, expect, it } from "vitest";

import { parseHighSchoolLevel, parseHighSchoolRevisionPlan } from "../lib/high-school-store";

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
});

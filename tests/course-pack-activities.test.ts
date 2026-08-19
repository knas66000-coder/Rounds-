import { describe, expect, it } from "vitest";
import { STARTER_COURSE_ACTIVITIES, starterActivityFor } from "../shared/course-pack-activities";

describe("Rounds starter course activities", () => {
  it("provides a subject-specific active starter activity for every non-Nursing active pack", () => {
    const packIds = new Set(STARTER_COURSE_ACTIVITIES.map((activity) => activity.packId));
    expect(packIds).toEqual(new Set(["university-foundation-year", "computing-foundations", "business-foundations", "engineering-foundations", "natural-sciences-foundations", "education-foundations", "social-sciences-foundations", "uganda-high-school-biology", "uganda-high-school-chemistry", "uganda-high-school-economics", "uganda-high-school-entrepreneurship", "uganda-high-school-english", "uganda-high-school-physics", "uganda-high-school-mathematics", "uganda-high-school-geography", "uganda-high-school-history-civics", "uganda-high-school-ict", "uganda-high-school-agriculture", "uganda-high-school-religion-ethics", "uganda-high-school-kiswahili", "uganda-high-school-literature", "uganda-high-school-fine-art", "uganda-high-school-technical-drawing", "uganda-high-school-food-nutrition", "uganda-high-school-music", "uganda-high-school-physical-education"]));
  });

  it("resolves activities only through the matching pack and course identifiers", () => {
    expect(starterActivityFor("computing-foundations", "computing-requirements")?.kind).toBe("evidence_reading");
    expect(starterActivityFor("business-foundations", "computing-requirements")).toBeNull();
    expect(starterActivityFor("nursing-practice", "nclex-practice")).toBeNull();
  });

  it("keeps starter content within its declared academic boundary", () => {
    expect(STARTER_COURSE_ACTIVITIES.every((activity) => !/NCLEX|diagnos|medication|patient/i.test(JSON.stringify(activity)))).toBe(true);
  });

  it("gives every active non-Nursing pack more than one reviewed activity while adding calculation or logic practice where appropriate", () => {
    const counts = STARTER_COURSE_ACTIVITIES.reduce<Record<string, number>>((result, activity) => ({ ...result, [activity.packId]: (result[activity.packId] ?? 0) + 1 }), {});
    expect(Object.values(counts).every((count) => count >= 2)).toBe(true);
    expect(STARTER_COURSE_ACTIVITIES.some((activity) => activity.kind === "worked_calculation")).toBe(true);
    expect(STARTER_COURSE_ACTIVITIES.some((activity) => activity.kind === "logic_trace")).toBe(true);
  });

  it("gives every active non-Nursing pack a reviewed scenario decision without using clinical content", () => {
    const scenarioPacks = new Set(STARTER_COURSE_ACTIVITIES.filter((activity) => activity.kind === "scenario").map((activity) => activity.packId));
    expect(scenarioPacks).toEqual(new Set(["university-foundation-year", "computing-foundations", "business-foundations", "engineering-foundations", "natural-sciences-foundations", "education-foundations", "social-sciences-foundations", "uganda-high-school-biology", "uganda-high-school-chemistry", "uganda-high-school-economics", "uganda-high-school-entrepreneurship", "uganda-high-school-english", "uganda-high-school-physics", "uganda-high-school-mathematics", "uganda-high-school-geography", "uganda-high-school-history-civics", "uganda-high-school-ict", "uganda-high-school-agriculture", "uganda-high-school-religion-ethics", "uganda-high-school-kiswahili", "uganda-high-school-literature", "uganda-high-school-fine-art", "uganda-high-school-technical-drawing", "uganda-high-school-food-nutrition", "uganda-high-school-music", "uganda-high-school-physical-education"]));
  });

  it("keeps every Uganda high-school pack active with three distinct original starter activities", () => {
    const highSchoolPackIds = ["uganda-high-school-biology", "uganda-high-school-chemistry", "uganda-high-school-economics", "uganda-high-school-entrepreneurship", "uganda-high-school-english", "uganda-high-school-physics", "uganda-high-school-mathematics", "uganda-high-school-geography", "uganda-high-school-history-civics", "uganda-high-school-ict", "uganda-high-school-agriculture", "uganda-high-school-religion-ethics", "uganda-high-school-kiswahili", "uganda-high-school-literature", "uganda-high-school-fine-art", "uganda-high-school-technical-drawing", "uganda-high-school-food-nutrition", "uganda-high-school-music", "uganda-high-school-physical-education"];
    for (const packId of highSchoolPackIds) {
      const activities = STARTER_COURSE_ACTIVITIES.filter((activity) => activity.packId === packId);
      expect(activities).toHaveLength(3);
      expect(new Set(activities.map((activity) => activity.courseId)).size).toBe(3);
      expect(activities.some((activity) => activity.kind === "scenario")).toBe(true);
    }
  });
});

import { describe, expect, it } from "vitest";
import { STARTER_COURSE_ACTIVITIES, starterActivityFor } from "../shared/course-pack-activities";

describe("Rounds starter course activities", () => {
  it("provides a subject-specific active starter activity for every non-Nursing active pack", () => {
    const packIds = new Set(STARTER_COURSE_ACTIVITIES.map((activity) => activity.packId));
    expect(packIds).toEqual(new Set(["university-foundation-year", "computing-foundations", "business-foundations", "engineering-foundations", "natural-sciences-foundations", "education-foundations", "social-sciences-foundations"]));
  });

  it("resolves activities only through the matching pack and course identifiers", () => {
    expect(starterActivityFor("computing-foundations", "computing-requirements")?.kind).toBe("evidence_reading");
    expect(starterActivityFor("business-foundations", "computing-requirements")).toBeNull();
    expect(starterActivityFor("nursing-practice", "nclex-practice")).toBeNull();
  });

  it("keeps starter content within its declared academic boundary", () => {
    expect(STARTER_COURSE_ACTIVITIES.every((activity) => !/NCLEX|diagnos|medication|patient/i.test(JSON.stringify(activity)))).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { courseActivityLabel, coursePackReadinessLabel, coursePacksForProgram, highSchoolCoursePacks, primaryCoursePackForProgram } from "../shared/course-packs";

describe("Rounds course-pack catalog", () => {
  it("keeps the shared Foundation Year catalog available across university programs without leaking Nursing content", () => {
    const computing = coursePacksForProgram("computing");
    expect(computing.map((pack) => pack.id)).toEqual(["university-foundation-year", "computing-foundations"]);
    expect(computing.some((pack) => pack.id === "nursing-practice")).toBe(false);
  });

  it("keeps Nursing as a distinct active reference pack alongside the shared foundation catalog", () => {
    const nursing = coursePacksForProgram("nursing");
    expect(nursing.map((pack) => pack.id)).toEqual(["nursing-practice", "university-foundation-year"]);
    expect(nursing.find((pack) => pack.id === "nursing-practice")?.readiness).toBe("active");
  });

  it("uses subject-neutral learning-mode labels and clear active-pack states", () => {
    expect(courseActivityLabel("writing_planner")).toBe("Writing planner");
    expect(coursePackReadinessLabel("active")).toBe("ACTIVE");
  });

  it("activates a distinct starter pack for every current university program", () => {
    const specialistPrograms = ["engineering", "computing", "business", "natural_sciences", "education", "social_sciences"] as const;
    const specialistsHaveOwnActiveStarter = specialistPrograms.every((program) => coursePacksForProgram(program).some((pack) => pack.audience !== "all_university" && pack.readiness === "active"));
    expect(specialistsHaveOwnActiveStarter).toBe(true);
    expect(coursePacksForProgram("foundation_year").some((pack) => pack.id === "university-foundation-year" && pack.readiness === "active")).toBe(true);
  });

  it("gives every program a primary learning round without reusing the Nursing reference pack", () => {
    expect(primaryCoursePackForProgram("nursing")?.id).toBe("nursing-practice");
    expect(primaryCoursePackForProgram("computing")?.id).toBe("computing-foundations");
    expect(primaryCoursePackForProgram("foundation_year")?.id).toBe("university-foundation-year");
    expect(primaryCoursePackForProgram("social_sciences")?.id).toBe("social-sciences-foundations");
  });

  it("gives every Uganda high-school subject an active primary pack without leaking university or Nursing content", () => {
    const highSchoolPacks = [
      ["uganda_high_school_biology", "uganda-high-school-biology"],
      ["uganda_high_school_chemistry", "uganda-high-school-chemistry"],
      ["uganda_high_school_economics", "uganda-high-school-economics"],
      ["uganda_high_school_entrepreneurship", "uganda-high-school-entrepreneurship"],
      ["uganda_high_school_english", "uganda-high-school-english"],
      ["uganda_high_school_physics", "uganda-high-school-physics"],
      ["uganda_high_school_mathematics", "uganda-high-school-mathematics"],
      ["uganda_high_school_geography", "uganda-high-school-geography"],
      ["uganda_high_school_history_civics", "uganda-high-school-history-civics"],
      ["uganda_high_school_ict", "uganda-high-school-ict"],
      ["uganda_high_school_agriculture", "uganda-high-school-agriculture"],
      ["uganda_high_school_religion_ethics", "uganda-high-school-religion-ethics"],
      ["uganda_high_school_kiswahili", "uganda-high-school-kiswahili"],
      ["uganda_high_school_literature", "uganda-high-school-literature"],
      ["uganda_high_school_fine_art", "uganda-high-school-fine-art"],
      ["uganda_high_school_technical_drawing", "uganda-high-school-technical-drawing"],
      ["uganda_high_school_food_nutrition", "uganda-high-school-food-nutrition"],
      ["uganda_high_school_music", "uganda-high-school-music"],
      ["uganda_high_school_physical_education", "uganda-high-school-physical-education"],
    ] as const;

    for (const [program, packId] of highSchoolPacks) {
      const available = coursePacksForProgram(program);
      expect(available.map((pack) => pack.id)).toEqual([packId]);
      expect(available[0]?.readiness).toBe("active");
      expect(available[0]?.delivery).toBe("downloadable");
      expect(available.some((pack) => pack.id === "nursing-practice" || pack.id === "university-foundation-year")).toBe(false);
      expect(primaryCoursePackForProgram(program)?.id).toBe(packId);
    }
    expect(highSchoolCoursePacks()).toHaveLength(highSchoolPacks.length);
    expect(highSchoolCoursePacks().every((pack) => pack.delivery === "downloadable" && pack.readiness === "active")).toBe(true);
  });
});

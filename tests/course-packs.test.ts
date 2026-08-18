import { describe, expect, it } from "vitest";
import { courseActivityLabel, coursePackReadinessLabel, coursePacksForProgram } from "../shared/course-packs";

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

  it("uses subject-neutral learning-mode labels and clear readiness states", () => {
    expect(courseActivityLabel("writing_planner")).toBe("Writing planner");
    expect(coursePackReadinessLabel("catalog")).toBe("CATALOG PREVIEW");
  });
});

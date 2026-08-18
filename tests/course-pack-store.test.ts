import { describe, expect, it } from "vitest";
import { canInstallPack, isPackInstalled, parseCoursePackInstalls, parseCoursePackResume } from "../lib/course-pack-store";
import { COURSE_PACKS } from "../shared/course-packs";

describe("Rounds local course-pack state", () => {
  it("treats the existing Nursing reference pack as embedded while rejecting catalog-only packs as installed", () => {
    const nursing = COURSE_PACKS.find((pack) => pack.id === "nursing-practice")!;
    const foundation = COURSE_PACKS.find((pack) => pack.id === "university-foundation-year")!;
    expect(isPackInstalled(nursing, [])).toBe(true);
    expect(isPackInstalled(foundation, [])).toBe(false);
    expect(canInstallPack(foundation)).toBe(false);
  });

  it("discards stale, duplicate, malformed, and non-downloadable persisted installs", () => {
    const value = JSON.stringify([
      { packId: "nursing-practice", revision: "embedded-nursing-v1", installedAt: "2026-08-18T00:00:00.000Z" },
      { packId: "missing", revision: "v1", installedAt: "2026-08-18T00:00:00.000Z" },
      { packId: "nursing-practice", revision: "embedded-nursing-v1", installedAt: "2026-08-18T00:00:01.000Z" },
    ]);
    expect(parseCoursePackInstalls(value)).toEqual([]);
  });

  it("keeps resume state only when the course still belongs to the reviewed pack catalog", () => {
    expect(parseCoursePackResume(JSON.stringify({ packId: "university-foundation-year", courseId: "academic-writing", updatedAt: "2026-08-18T00:00:00.000Z" }))).toEqual({ packId: "university-foundation-year", courseId: "academic-writing", updatedAt: "2026-08-18T00:00:00.000Z" });
    expect(parseCoursePackResume(JSON.stringify({ packId: "university-foundation-year", courseId: "invented-course", updatedAt: "2026-08-18T00:00:00.000Z" }))).toBeNull();
  });
});

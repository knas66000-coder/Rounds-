import { describe, expect, it } from "vitest";
import { canInstallPack, isPackInstalled, parseCoursePackInstalls, parseCoursePackResume } from "../lib/course-pack-store";
import { COURSE_PACKS } from "../shared/course-packs";

describe("Rounds local course-pack state", () => {
  it("treats the existing Nursing reference pack as embedded while letting the Foundation Year starter pack be installed locally", () => {
    const nursing = COURSE_PACKS.find((pack) => pack.id === "nursing-practice")!;
    const foundation = COURSE_PACKS.find((pack) => pack.id === "university-foundation-year")!;
    expect(isPackInstalled(nursing, [])).toBe(true);
    expect(isPackInstalled(foundation, [])).toBe(false);
    expect(canInstallPack(foundation)).toBe(true);
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

  it("accepts a matching reviewed Foundation Year local install record", () => {
    const foundation = COURSE_PACKS.find((pack) => pack.id === "university-foundation-year")!;
    const installs = parseCoursePackInstalls(JSON.stringify([{ packId: foundation.id, revision: foundation.revision, installedAt: "2026-08-18T00:00:00.000Z" }]));
    expect(installs).toHaveLength(1);
    expect(isPackInstalled(foundation, installs)).toBe(true);
  });

  it("keeps high-school core installs downloadable and isolated by the reviewed pack revision", () => {
    const geography = COURSE_PACKS.find((pack) => pack.id === "uganda-high-school-geography")!;
    const installs = parseCoursePackInstalls(JSON.stringify([{ packId: geography.id, revision: geography.revision, installedAt: "2026-08-19T00:00:00.000Z" }]));
    expect(canInstallPack(geography)).toBe(true);
    expect(isPackInstalled(geography, installs)).toBe(true);
    expect(parseCoursePackInstalls(JSON.stringify([{ packId: geography.id, revision: "stale", installedAt: "2026-08-19T00:00:00.000Z" }]))).toEqual([]);
  });

  it("accepts the specialist elective packs as isolated downloadable local installs", () => {
    const technicalDrawing = COURSE_PACKS.find((pack) => pack.id === "uganda-high-school-technical-drawing")!;
    const installs = parseCoursePackInstalls(JSON.stringify([{ packId: technicalDrawing.id, revision: technicalDrawing.revision, installedAt: "2026-08-19T00:00:00.000Z" }]));
    expect(canInstallPack(technicalDrawing)).toBe(true);
    expect(isPackInstalled(technicalDrawing, installs)).toBe(true);
  });
});

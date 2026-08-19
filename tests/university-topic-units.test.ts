import { describe, expect, it } from "vitest";

import { searchUniversityTopics } from "../lib/university-topic-search";
import { savedUniversityTopicSession, selectedUniversityTopicSession, selectUniversityTopicSession } from "../lib/university-topic-session";
import { UNIVERSITY_TOPIC_UNITS, universityTopicUnitsForPack } from "../shared/university-topic-units";

const universityPackIds = [
  "university-foundation-year",
  "computing-foundations",
  "business-foundations",
  "engineering-foundations",
  "natural-sciences-foundations",
  "education-foundations",
  "social-sciences-foundations",
];

describe("university topic pathways", () => {
  it("gives every active university pack eighteen local units across six distinct topic families", () => {
    expect(UNIVERSITY_TOPIC_UNITS).toHaveLength(126);
    for (const packId of universityPackIds) {
      const units = universityTopicUnitsForPack(packId);
      expect(units).toHaveLength(18);
      expect(new Set(units.map((unit) => unit.topicId)).size).toBe(6);
      expect(units.filter((unit) => unit.mode === "focus")).toHaveLength(6);
      expect(units.filter((unit) => unit.mode === "apply")).toHaveLength(6);
      expect(units.filter((unit) => unit.mode === "reflection")).toHaveLength(6);
      expect(units.every((unit) => unit.packId === packId)).toBe(true);
    }
  });

  it("builds four-topic sessions without repeating a unit, topic family, or unnecessary adjacent mode", () => {
    const packId = "computing-foundations";
    const units = universityTopicUnitsForPack(packId);
    const reviewUnit = units.find((unit) => unit.id.endsWith(":focus"))!;
    const savedUnit = units.find((unit) => unit.id.endsWith(":apply") && unit.topicId !== reviewUnit.topicId)!;
    const session = selectUniversityTopicSession(packId, { records: [{ unitId: reviewUnit.id, outcome: "review", completedAt: "2026-08-20T10:00:00.000Z" }], savedUnitIds: [savedUnit.id] }, 4, 2);

    expect(session).toHaveLength(4);
    expect(new Set(session.map((item) => item.unit.id)).size).toBe(4);
    expect(new Set(session.map((item) => item.unit.topicId)).size).toBe(4);
    expect(session.some((item) => item.reason === "review_topic")).toBe(true);
    expect(session.some((item) => item.reason === "saved_topic")).toBe(true);
    for (let index = 1; index < session.length; index += 1) expect(session[index].unit.mode).not.toBe(session[index - 1].unit.mode);
  });

  it("keeps offline search and direct entries inside the active university pack", () => {
    const results = searchUniversityTopics("computing-foundations", "user requirements");
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((unit) => unit.packId === "computing-foundations")).toBe(true);
    expect(searchUniversityTopics("business-foundations", "user requirements")).toEqual([]);

    const computingUnit = universityTopicUnitsForPack("computing-foundations").find((unit) => unit.mode === "focus")!;
    const reflectionUnit = universityTopicUnitsForPack("computing-foundations").find((unit) => unit.mode === "reflection")!;
    expect(selectedUniversityTopicSession("business-foundations", computingUnit.id)).toEqual([]);
    expect(selectedUniversityTopicSession("computing-foundations", reflectionUnit.id)).toEqual([]);
    expect(selectedUniversityTopicSession("computing-foundations", computingUnit.id)).toHaveLength(1);
    expect(savedUniversityTopicSession("computing-foundations", computingUnit.id, { records: [], savedUnitIds: [] })).toEqual([]);
    expect(savedUniversityTopicSession("computing-foundations", computingUnit.id, { records: [], savedUnitIds: [computingUnit.id] })).toHaveLength(1);
  });
});

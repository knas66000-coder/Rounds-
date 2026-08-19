import { describe, expect, it } from "vitest";

import { recordHighSchoolTopicOutcome, parseHighSchoolTopicProgress, toggleHighSchoolTopicSaved } from "../lib/high-school-topic-store";
import { selectHighSchoolTopicSession } from "../lib/high-school-topic-session";
import { HIGH_SCHOOL_TOPIC_UNITS, isUnitRecommendedForLevel, topicUnitForId, topicUnitsForPack } from "../shared/high-school-topic-units";
import { highSchoolCoursePacks } from "../shared/course-packs";

describe("Rounds high-school topic units", () => {
  it("gives every active high-school pack six original topic units across three level bands", () => {
    const packs = highSchoolCoursePacks();
    expect(HIGH_SCHOOL_TOPIC_UNITS).toHaveLength(packs.length * 6);
    for (const pack of packs) {
      const units = topicUnitsForPack(pack.id);
      expect(units).toHaveLength(6);
      expect(new Set(units.map((unit) => unit.topicId)).size).toBe(6);
      expect(units.filter((unit) => unit.band === "foundation")).toHaveLength(2);
      expect(units.filter((unit) => unit.band === "development")).toHaveLength(2);
      expect(units.filter((unit) => unit.band === "extension")).toHaveLength(2);
    }
  });

  it("targets the selected Senior learning band while retaining distinct reflection companions", () => {
    const foundation = topicUnitForId("biology-living-systems-foundation")!;
    const reflection = topicUnitForId("biology-living-systems-foundation-reflection")!;
    expect(isUnitRecommendedForLevel(foundation, "s1")).toBe(true);
    expect(isUnitRecommendedForLevel(foundation, "s4")).toBe(false);
    expect(isUnitRecommendedForLevel(topicUnitForId("biology-variables-development")!, "s4")).toBe(true);
    expect(isUnitRecommendedForLevel(topicUnitForId("biology-explanation-extension")!, "s6")).toBe(true);
    expect(reflection.mode).toBe("reflection");
    expect(reflection.topicId).not.toBe(foundation.topicId);
  });

  it("rejects malformed or unknown private progress records and keeps a valid saved record local", () => {
    const unit = topicUnitForId("english-main-idea-foundation")!;
    expect(parseHighSchoolTopicProgress(JSON.stringify({ records: [{ unitId: "missing", outcome: "mastered", completedAt: "x" }], savedUnitIds: ["missing"] }))).toEqual({ records: [], savedUnitIds: [] });
    const recorded = recordHighSchoolTopicOutcome({ records: [], savedUnitIds: [] }, unit.id, "review", "2026-08-19T00:00:00.000Z");
    const saved = toggleHighSchoolTopicSaved(recorded, unit.id);
    expect(saved.records).toEqual([{ unitId: unit.id, outcome: "review", completedAt: "2026-08-19T00:00:00.000Z" }]);
    expect(saved.savedUnitIds).toEqual([unit.id]);
  });

  it("builds a no-repeat varied session that favours the selected level and keeps a review need visible", () => {
    const packId = "uganda-high-school-biology";
    const state = recordHighSchoolTopicOutcome({ records: [], savedUnitIds: [] }, "biology-living-systems-foundation", "review", "2026-08-19T00:00:00.000Z");
    const session = selectHighSchoolTopicSession(packId, "s1", state, 3, 4);
    expect(session).toHaveLength(3);
    expect(new Set(session.map((item) => item.unit.id)).size).toBe(3);
    expect(new Set(session.map((item) => item.unit.topicId)).size).toBe(3);
    expect(new Set(session.map((item) => item.unit.mode)).size).toBe(3);
    expect(session.some((item) => item.unit.id === "biology-living-systems-foundation" && item.reason === "review_topic")).toBe(true);
    expect(session.filter((item) => item.unit.band === "foundation")).toHaveLength(2);
  });

  it("can deliberately surface a saved extension topic while keeping the session inside the same subject", () => {
    const packId = "uganda-high-school-mathematics";
    const saved = toggleHighSchoolTopicSaved({ records: [], savedUnitIds: [] }, "mathematics-justification-extension");
    const session = selectHighSchoolTopicSession(packId, "s6", saved, 3, 2);
    expect(session.every((item) => item.unit.packId === packId)).toBe(true);
    expect(session.some((item) => item.unit.id === "mathematics-justification-extension" && item.reason === "saved_topic")).toBe(true);
  });
});

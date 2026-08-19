import { describe, expect, it } from "vitest";

import { selectedHighSchoolTopicSession } from "../lib/high-school-topic-session";
import { normalizeHighSchoolTopicSearch, searchHighSchoolTopics } from "../lib/high-school-topic-search";

describe("Rounds high-school private topic search", () => {
  it("normalizes local query text and finds a direct topic by title, cue, or topic identifier", () => {
    expect(normalizeHighSchoolTopicSearch("  CÍRCUIT   representations ")).toBe("circuit representations");
    const matches = searchHighSchoolTopics("uganda-high-school-physics", "circuit representations");
    expect(matches[0]).toMatchObject({ unit: { id: "physics-circuits-pathway-three-foundation", packId: "uganda-high-school-physics" } });
  });

  it("keeps results inside the selected subject pack and excludes private reflection companions", () => {
    expect(searchHighSchoolTopics("uganda-high-school-biology", "circuit")).toEqual([]);
    const matches = searchHighSchoolTopics("uganda-high-school-biology", "variables");
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.every((result) => result.unit.packId === "uganda-high-school-biology" && result.unit.mode !== "reflection")).toBe(true);
  });

  it("opens only a requested direct local topic from the matching pack", () => {
    expect(selectedHighSchoolTopicSession("uganda-high-school-physics", "physics-circuits-pathway-three-foundation")).toMatchObject([{ reason: "search_topic", unit: { id: "physics-circuits-pathway-three-foundation" } }]);
    expect(selectedHighSchoolTopicSession("uganda-high-school-biology", "physics-circuits-pathway-three-foundation")).toEqual([]);
    expect(selectedHighSchoolTopicSession("uganda-high-school-physics", "physics-circuits-pathway-three-foundation-reflection")).toEqual([]);
  });

  it("returns no results for empty or too-short local searches", () => {
    expect(searchHighSchoolTopics("uganda-high-school-physics", "")).toEqual([]);
    expect(searchHighSchoolTopics("uganda-high-school-physics", "a")).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";

import { savedHighSchoolTopicsForPack } from "../lib/high-school-saved-topics";
import { savedHighSchoolTopicSession } from "../lib/high-school-topic-session";
import { toggleHighSchoolTopicSaved, type HighSchoolTopicProgressState } from "../lib/high-school-topic-store";

const biologyUnit = "biology-living-systems-foundation";
const biologyReflection = "biology-living-systems-foundation-reflection";
const chemistryUnit = "chemistry-particle-description-foundation";

describe("Rounds high-school private saved-topic collection", () => {
  it("keeps only the selected subject pack and returns newest saved topics first", () => {
    const state: HighSchoolTopicProgressState = { records: [], savedUnitIds: [biologyUnit, chemistryUnit, biologyReflection] };
    expect(savedHighSchoolTopicsForPack("uganda-high-school-biology", state).map((unit) => unit.id)).toEqual([biologyReflection, biologyUnit]);
    expect(savedHighSchoolTopicsForPack("uganda-high-school-chemistry", state).map((unit) => unit.id)).toEqual([chemistryUnit]);
  });

  it("supports a saved-only direct review entry and rejects mismatched or unsaved topic identifiers", () => {
    const state: HighSchoolTopicProgressState = { records: [], savedUnitIds: [biologyUnit] };
    expect(savedHighSchoolTopicSession("uganda-high-school-biology", biologyUnit, state)).toMatchObject([{ reason: "saved_topic", unit: { id: biologyUnit } }]);
    expect(savedHighSchoolTopicSession("uganda-high-school-chemistry", biologyUnit, state)).toEqual([]);
    expect(savedHighSchoolTopicSession("uganda-high-school-biology", chemistryUnit, state)).toEqual([]);
  });

  it("updates an empty collection after a saved topic is removed locally", () => {
    const saved = toggleHighSchoolTopicSaved({ records: [], savedUnitIds: [] }, biologyUnit);
    expect(savedHighSchoolTopicsForPack("uganda-high-school-biology", saved).map((unit) => unit.id)).toEqual([biologyUnit]);
    const removed = toggleHighSchoolTopicSaved(saved, biologyUnit);
    expect(savedHighSchoolTopicsForPack("uganda-high-school-biology", removed)).toEqual([]);
  });
});

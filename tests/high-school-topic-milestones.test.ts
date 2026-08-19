import { describe, expect, it } from "vitest";

import { highSchoolTopicMilestoneSummary } from "../lib/high-school-topic-milestones";
import { recordHighSchoolTopicOutcome, topicProgressForPack } from "../lib/high-school-topic-store";

describe("Rounds high-school topic completion milestones", () => {
  it("moves through the private 1, 6, 12, and 18-topic pathway thresholds", () => {
    expect(highSchoolTopicMilestoneSummary(0, 18)).toMatchObject({ achieved: null, next: { id: "first_topic", threshold: 1 }, topicsToNext: 1, progressPercent: 0 });
    expect(highSchoolTopicMilestoneSummary(6, 18)).toMatchObject({ achieved: { id: "first_pathway" }, next: { id: "deeper_pathways", threshold: 12 }, topicsToNext: 6, progressPercent: 33 });
    expect(highSchoolTopicMilestoneSummary(12, 18)).toMatchObject({ achieved: { id: "deeper_pathways" }, next: { id: "subject_pathway_complete", threshold: 18 }, topicsToNext: 6, progressPercent: 67 });
    expect(highSchoolTopicMilestoneSummary(18, 18)).toMatchObject({ achieved: { id: "subject_pathway_complete" }, next: null, topicsToNext: 0, progressPercent: 100 });
  });

  it("safely bounds malformed progress rather than producing a grade or impossible milestone", () => {
    expect(highSchoolTopicMilestoneSummary(-3, 18)).toMatchObject({ completed: 0, total: 18, progressPercent: 0 });
    expect(highSchoolTopicMilestoneSummary(25, 18)).toMatchObject({ completed: 18, total: 18, progressPercent: 100 });
    expect(highSchoolTopicMilestoneSummary(6, 0)).toMatchObject({ completed: 0, total: 0, achieved: null, next: null, progressPercent: 0 });
  });

  it("derives every milestone from its own local subject progress only", () => {
    const state = recordHighSchoolTopicOutcome({ records: [], savedUnitIds: [] }, "biology-living-systems-foundation", "mastered", "2026-08-19T00:00:00.000Z");
    const biology = topicProgressForPack("uganda-high-school-biology", state);
    const chemistry = topicProgressForPack("uganda-high-school-chemistry", state);
    expect(highSchoolTopicMilestoneSummary(biology.completed, biology.total)).toMatchObject({ achieved: { id: "first_topic" } });
    expect(highSchoolTopicMilestoneSummary(chemistry.completed, chemistry.total)).toMatchObject({ achieved: null, next: { id: "first_topic" } });
  });
});

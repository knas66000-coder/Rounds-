export type HighSchoolTopicMilestoneId = "first_topic" | "first_pathway" | "deeper_pathways" | "subject_pathway_complete";

export type HighSchoolTopicMilestone = {
  id: HighSchoolTopicMilestoneId;
  threshold: number;
  title: string;
  detail: string;
};

export type HighSchoolTopicMilestoneSummary = {
  completed: number;
  total: number;
  achieved: HighSchoolTopicMilestone | null;
  next: HighSchoolTopicMilestone | null;
  completedMilestoneIds: HighSchoolTopicMilestoneId[];
  topicsToNext: number;
  progressPercent: number;
};

/**
 * These thresholds describe original Rounds topic-pathway progress only. They
 * are calculated from local learner records and never represent grades,
 * syllabus coverage, readiness predictions, or external recognition.
 */
export const HIGH_SCHOOL_TOPIC_MILESTONES: readonly HighSchoolTopicMilestone[] = [
  { id: "first_topic", threshold: 1, title: "First topic explored", detail: "You have started a private subject pathway." },
  { id: "first_pathway", threshold: 6, title: "First pathway built", detail: "You have completed the first six-topic learning layer." },
  { id: "deeper_pathways", threshold: 12, title: "Depth expanded", detail: "You have explored two topic pathways in this subject." },
  { id: "subject_pathway_complete", threshold: 18, title: "Subject pathway complete", detail: "You have completed all currently available local topic units in this subject." },
];

export function highSchoolTopicMilestoneSummary(completed: number, total: number): HighSchoolTopicMilestoneSummary {
  const safeTotal = Math.max(0, Math.floor(total));
  const safeCompleted = Math.min(safeTotal, Math.max(0, Math.floor(completed)));
  const milestones = HIGH_SCHOOL_TOPIC_MILESTONES.filter((milestone) => milestone.threshold <= safeTotal);
  const completedMilestones = milestones.filter((milestone) => safeCompleted >= milestone.threshold);
  const achieved = completedMilestones.at(-1) ?? null;
  const next = milestones.find((milestone) => safeCompleted < milestone.threshold) ?? null;
  return {
    completed: safeCompleted,
    total: safeTotal,
    achieved,
    next,
    completedMilestoneIds: completedMilestones.map((milestone) => milestone.id),
    topicsToNext: next ? next.threshold - safeCompleted : 0,
    progressPercent: safeTotal ? Math.round((safeCompleted / safeTotal) * 100) : 0,
  };
}

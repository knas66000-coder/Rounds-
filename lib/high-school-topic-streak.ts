import type { HighSchoolTopicProgressState } from "./high-school-topic-store";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

export type HighSchoolWeeklyStreak = {
  currentWeeks: number;
  longestWeeks: number;
  activeThisWeek: boolean;
  activeWeekStarts: number[];
  nextStep: string;
};

function utcWeekStart(value: Date): number | null {
  if (Number.isNaN(value.getTime())) return null;
  const midnight = Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
  const daysSinceMonday = (value.getUTCDay() + 6) % 7;
  return midnight - daysSinceMonday * DAY_MS;
}

/**
 * A week becomes active after one completed topic. This is a private local
 * consistency signal, not a grade, attendance record, deadline, or comparison
 * with another learner. UTC week boundaries keep calculations deterministic.
 */
export function highSchoolWeeklyStreak(progress: HighSchoolTopicProgressState, now = new Date()): HighSchoolWeeklyStreak {
  const currentWeekStart = utcWeekStart(now);
  if (currentWeekStart === null) return { currentWeeks: 0, longestWeeks: 0, activeThisWeek: false, activeWeekStarts: [], nextStep: "Complete one topic when you are ready to start a private weekly study rhythm." };

  const activeWeeks = new Set<number>();
  for (const record of progress.records) {
    const weekStart = utcWeekStart(new Date(record.completedAt));
    if (weekStart !== null && weekStart <= currentWeekStart) activeWeeks.add(weekStart);
  }
  const activeWeekStarts = [...activeWeeks].sort((left, right) => right - left);
  const activeThisWeek = activeWeeks.has(currentWeekStart);

  let currentWeeks = 0;
  for (let cursor = currentWeekStart; activeWeeks.has(cursor); cursor -= WEEK_MS) currentWeeks += 1;

  const ascendingWeeks = [...activeWeeks].sort((left, right) => left - right);
  let longestWeeks = 0;
  let runningWeeks = 0;
  let previousWeek: number | null = null;
  for (const weekStart of ascendingWeeks) {
    runningWeeks = previousWeek === weekStart - WEEK_MS ? runningWeeks + 1 : 1;
    longestWeeks = Math.max(longestWeeks, runningWeeks);
    previousWeek = weekStart;
  }

  const nextStep = activeThisWeek
    ? `This week is active. Continue at your own pace; your current private streak is ${currentWeeks} ${currentWeeks === 1 ? "week" : "weeks"}.`
    : "Complete one topic this week to begin or renew your private study rhythm.";
  return { currentWeeks, longestWeeks, activeThisWeek, activeWeekStarts, nextStep };
}

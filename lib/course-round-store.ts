import AsyncStorage from "@react-native-async-storage/async-storage";

import { STARTER_COURSE_ACTIVITIES, starterActivityFor, type StarterCourseActivity } from "../shared/course-pack-activities";

export const COURSE_ROUND_STATE_KEY = "rounds.course-round.state.v1";
export type CourseRoundOutcome = "correct" | "review" | "completed";
export type CourseRoundRecord = { activityId: string; outcome: CourseRoundOutcome; completedAt: string };
export type CourseRoundState = { records: CourseRoundRecord[]; bookmarks: string[] };

export function courseRoundActivityId(activity: Pick<StarterCourseActivity, "packId" | "courseId">): string {
  return `${activity.packId}:${activity.courseId}`;
}

function isKnownActivityId(value: string): boolean {
  const [packId, courseId, ...rest] = value.split(":");
  return Boolean(packId && courseId && rest.length === 0 && starterActivityFor(packId, courseId));
}

export function parseCourseRoundState(value: string | null): CourseRoundState {
  const fallback: CourseRoundState = { records: [], bookmarks: [] };
  if (!value) return fallback;
  try {
    const candidate = JSON.parse(value) as Partial<CourseRoundState>;
    const seenRecords = new Set<string>();
    const records = Array.isArray(candidate.records) ? candidate.records.flatMap((record) => {
      if (!record || typeof record !== "object") return [];
      const next = record as Partial<CourseRoundRecord>;
      if (typeof next.activityId !== "string" || typeof next.completedAt !== "string" || !["correct", "review", "completed"].includes(next.outcome ?? "") || !isKnownActivityId(next.activityId) || seenRecords.has(next.activityId)) return [];
      seenRecords.add(next.activityId);
      return [{ activityId: next.activityId, outcome: next.outcome as CourseRoundOutcome, completedAt: next.completedAt }];
    }) : [];
    const seenBookmarks = new Set<string>();
    const bookmarks = Array.isArray(candidate.bookmarks) ? candidate.bookmarks.filter((id): id is string => typeof id === "string" && isKnownActivityId(id) && !seenBookmarks.has(id) && (seenBookmarks.add(id), true)) : [];
    return { records, bookmarks };
  } catch {
    return fallback;
  }
}

export function activitiesForCourseRound(packId: string, state: CourseRoundState, reviewOnly = false): StarterCourseActivity[] {
  const source = STARTER_COURSE_ACTIVITIES.filter((activity) => activity.packId === packId);
  const selected = reviewOnly ? source.filter((activity) => state.bookmarks.includes(courseRoundActivityId(activity))) : source;
  return [...selected].sort((left, right) => courseRoundActivityId(left).localeCompare(courseRoundActivityId(right)));
}

export function toggleCourseRoundBookmark(state: CourseRoundState, activityId: string): CourseRoundState {
  if (!isKnownActivityId(activityId)) return state;
  return { ...state, bookmarks: state.bookmarks.includes(activityId) ? state.bookmarks.filter((id) => id !== activityId) : [...state.bookmarks, activityId] };
}

export function recordCourseRoundOutcome(state: CourseRoundState, activityId: string, outcome: CourseRoundOutcome, completedAt = new Date().toISOString()): CourseRoundState {
  if (!isKnownActivityId(activityId)) return state;
  const record = { activityId, outcome, completedAt };
  return { ...state, records: [record, ...state.records.filter((item) => item.activityId !== activityId)] };
}

export function courseRoundSnapshot(packId: string, state: CourseRoundState) {
  const ids = new Set(STARTER_COURSE_ACTIVITIES.filter((activity) => activity.packId === packId).map(courseRoundActivityId));
  const records = state.records.filter((record) => ids.has(record.activityId));
  return { completed: records.length, correct: records.filter((record) => record.outcome === "correct").length, review: records.filter((record) => record.outcome === "review").length, saved: state.bookmarks.filter((id) => ids.has(id)).length };
}

export async function loadCourseRoundState(): Promise<CourseRoundState> {
  return parseCourseRoundState(await AsyncStorage.getItem(COURSE_ROUND_STATE_KEY));
}

export async function saveCourseRoundState(state: CourseRoundState): Promise<void> {
  await AsyncStorage.setItem(COURSE_ROUND_STATE_KEY, JSON.stringify(state));
}

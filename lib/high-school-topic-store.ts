import AsyncStorage from "@react-native-async-storage/async-storage";

import { topicUnitForId } from "../shared/high-school-topic-units";

export const HIGH_SCHOOL_TOPIC_PROGRESS_KEY = "rounds.high-school.topic-progress.v1";

export type HighSchoolTopicOutcome = "mastered" | "review" | "reflected";
export type HighSchoolTopicProgressRecord = { unitId: string; outcome: HighSchoolTopicOutcome; completedAt: string };
export type HighSchoolTopicProgressState = { records: HighSchoolTopicProgressRecord[]; savedUnitIds: string[] };

const fallback: HighSchoolTopicProgressState = { records: [], savedUnitIds: [] };

export function parseHighSchoolTopicProgress(value: string | null): HighSchoolTopicProgressState {
  if (!value) return fallback;
  try {
    const candidate = JSON.parse(value) as Partial<HighSchoolTopicProgressState>;
    const seenRecords = new Set<string>();
    const records = Array.isArray(candidate.records) ? candidate.records.flatMap((record) => {
      if (!record || typeof record !== "object") return [];
      const next = record as Partial<HighSchoolTopicProgressRecord>;
      if (typeof next.unitId !== "string" || typeof next.completedAt !== "string" || !["mastered", "review", "reflected"].includes(next.outcome ?? "") || !topicUnitForId(next.unitId) || seenRecords.has(next.unitId)) return [];
      seenRecords.add(next.unitId);
      return [{ unitId: next.unitId, outcome: next.outcome as HighSchoolTopicOutcome, completedAt: next.completedAt }];
    }) : [];
    const seenSaved = new Set<string>();
    const savedUnitIds = Array.isArray(candidate.savedUnitIds) ? candidate.savedUnitIds.filter((unitId): unitId is string => typeof unitId === "string" && Boolean(topicUnitForId(unitId)) && !seenSaved.has(unitId) && (seenSaved.add(unitId), true)) : [];
    return { records, savedUnitIds };
  } catch {
    return fallback;
  }
}

export function recordHighSchoolTopicOutcome(state: HighSchoolTopicProgressState, unitId: string, outcome: HighSchoolTopicOutcome, completedAt = new Date().toISOString()): HighSchoolTopicProgressState {
  if (!topicUnitForId(unitId)) return state;
  return { ...state, records: [{ unitId, outcome, completedAt }, ...state.records.filter((record) => record.unitId !== unitId)] };
}

export function toggleHighSchoolTopicSaved(state: HighSchoolTopicProgressState, unitId: string): HighSchoolTopicProgressState {
  if (!topicUnitForId(unitId)) return state;
  return { ...state, savedUnitIds: state.savedUnitIds.includes(unitId) ? state.savedUnitIds.filter((id) => id !== unitId) : [...state.savedUnitIds, unitId] };
}

export function topicProgressForPack(packId: string, state: HighSchoolTopicProgressState) {
  const ids = new Set<string>();
  for (const record of state.records) if (topicUnitForId(record.unitId)?.packId === packId) ids.add(record.unitId);
  const records = state.records.filter((record) => ids.has(record.unitId));
  return { completed: records.length, mastered: records.filter((record) => record.outcome === "mastered").length, review: records.filter((record) => record.outcome === "review").length, reflected: records.filter((record) => record.outcome === "reflected").length, saved: state.savedUnitIds.filter((unitId) => topicUnitForId(unitId)?.packId === packId).length };
}

export async function loadHighSchoolTopicProgress(): Promise<HighSchoolTopicProgressState> {
  return parseHighSchoolTopicProgress(await AsyncStorage.getItem(HIGH_SCHOOL_TOPIC_PROGRESS_KEY));
}

export async function saveHighSchoolTopicProgress(state: HighSchoolTopicProgressState): Promise<void> {
  await AsyncStorage.setItem(HIGH_SCHOOL_TOPIC_PROGRESS_KEY, JSON.stringify(state));
}

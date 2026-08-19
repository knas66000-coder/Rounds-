import AsyncStorage from "@react-native-async-storage/async-storage";

import { universityTopicUnitForId } from "../shared/university-topic-units";

export const UNIVERSITY_TOPIC_PROGRESS_KEY = "rounds.university-topic-progress.v1";
export type UniversityTopicOutcome = "mastered" | "review" | "reflected";
export type UniversityTopicProgressRecord = { unitId: string; outcome: UniversityTopicOutcome; completedAt: string };
export type UniversityTopicProgressState = { records: UniversityTopicProgressRecord[]; savedUnitIds: string[] };

const fallback: UniversityTopicProgressState = { records: [], savedUnitIds: [] };

export function parseUniversityTopicProgress(value: string | null): UniversityTopicProgressState {
  if (!value) return fallback;
  try {
    const candidate = JSON.parse(value) as Partial<UniversityTopicProgressState>;
    const seenRecords = new Set<string>();
    const records = Array.isArray(candidate.records) ? candidate.records.flatMap((record) => {
      if (!record || typeof record !== "object") return [];
      const next = record as Partial<UniversityTopicProgressRecord>;
      if (typeof next.unitId !== "string" || typeof next.completedAt !== "string" || !["mastered", "review", "reflected"].includes(next.outcome ?? "") || !universityTopicUnitForId(next.unitId) || seenRecords.has(next.unitId)) return [];
      seenRecords.add(next.unitId);
      return [{ unitId: next.unitId, outcome: next.outcome as UniversityTopicOutcome, completedAt: next.completedAt }];
    }) : [];
    const seenSaved = new Set<string>();
    const savedUnitIds = Array.isArray(candidate.savedUnitIds) ? candidate.savedUnitIds.filter((unitId): unitId is string => typeof unitId === "string" && Boolean(universityTopicUnitForId(unitId)) && !seenSaved.has(unitId) && (seenSaved.add(unitId), true)) : [];
    return { records, savedUnitIds };
  } catch {
    return fallback;
  }
}

export function recordUniversityTopicOutcome(state: UniversityTopicProgressState, unitId: string, outcome: UniversityTopicOutcome, completedAt = new Date().toISOString()): UniversityTopicProgressState {
  if (!universityTopicUnitForId(unitId)) return state;
  return { ...state, records: [{ unitId, outcome, completedAt }, ...state.records.filter((record) => record.unitId !== unitId)] };
}

export function toggleUniversityTopicSaved(state: UniversityTopicProgressState, unitId: string): UniversityTopicProgressState {
  if (!universityTopicUnitForId(unitId)) return state;
  return { ...state, savedUnitIds: state.savedUnitIds.includes(unitId) ? state.savedUnitIds.filter((id) => id !== unitId) : [...state.savedUnitIds, unitId] };
}

export function universityTopicProgressForPack(packId: string, state: UniversityTopicProgressState) {
  const records = state.records.filter((record) => universityTopicUnitForId(record.unitId)?.packId === packId);
  return { completed: records.length, mastered: records.filter((record) => record.outcome === "mastered").length, review: records.filter((record) => record.outcome === "review").length, reflected: records.filter((record) => record.outcome === "reflected").length, saved: state.savedUnitIds.filter((unitId) => universityTopicUnitForId(unitId)?.packId === packId).length };
}

export async function loadUniversityTopicProgress(): Promise<UniversityTopicProgressState> {
  return parseUniversityTopicProgress(await AsyncStorage.getItem(UNIVERSITY_TOPIC_PROGRESS_KEY));
}

export async function saveUniversityTopicProgress(state: UniversityTopicProgressState): Promise<void> {
  await AsyncStorage.setItem(UNIVERSITY_TOPIC_PROGRESS_KEY, JSON.stringify(state));
}

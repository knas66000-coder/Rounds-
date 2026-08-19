import type { UniversityTopicProgressState } from "./university-topic-store";
import { universityTopicUnitForId, universityTopicUnitsForPack, type UniversityTopicUnit } from "../shared/university-topic-units";

export type UniversityTopicSessionReason = "new_topic" | "review_topic" | "saved_topic" | "refresh_topic" | "search_topic";
export type UniversityTopicSessionItem = { unit: UniversityTopicUnit; reason: UniversityTopicSessionReason };

const priority: Record<UniversityTopicSessionReason, number> = { new_topic: 0, review_topic: 1, saved_topic: 2, refresh_topic: 3, search_topic: 4 };

function stableRank(value: string, nonce: number): number {
  let hash = (nonce + 1) * 31;
  for (const character of value) hash = (hash * 33 + character.charCodeAt(0)) >>> 0;
  return hash;
}

function reasonForUnit(unit: UniversityTopicUnit, state: UniversityTopicProgressState): UniversityTopicSessionReason {
  const record = state.records.find((item) => item.unitId === unit.id);
  if (record?.outcome === "review") return "review_topic";
  if (state.savedUnitIds.includes(unit.id)) return "saved_topic";
  if (!record) return "new_topic";
  return "refresh_topic";
}

function canUseMode(candidate: UniversityTopicUnit, selected: UniversityTopicSessionItem[], candidates: UniversityTopicUnit[]): boolean {
  const previousMode = selected.at(-1)?.unit.mode;
  if (!previousMode || candidate.mode !== previousMode) return true;
  return !candidates.some((unit) => unit.id !== candidate.id && !selected.some((item) => item.unit.id === unit.id || item.unit.topicId === unit.topicId) && unit.mode !== previousMode);
}

/** Builds a private, local four-topic session without repeated topics or unnecessary repeated activity modes. */
export function selectUniversityTopicSession(packId: string, state: UniversityTopicProgressState, count = 4, nonce = 0): UniversityTopicSessionItem[] {
  const candidates = universityTopicUnitsForPack(packId);
  const ranked = [...candidates].sort((left, right) => priority[reasonForUnit(left, state)] - priority[reasonForUnit(right, state)] || stableRank(left.id, nonce) - stableRank(right.id, nonce));
  const selected: UniversityTopicSessionItem[] = [];
  const add = (unit: UniversityTopicUnit) => {
    if (selected.length >= count || selected.some((item) => item.unit.id === unit.id || item.unit.topicId === unit.topicId) || !canUseMode(unit, selected, ranked)) return;
    selected.push({ unit, reason: reasonForUnit(unit, state) });
  };
  for (const reason of ["review_topic", "saved_topic", "new_topic", "refresh_topic"] as const) {
    const candidate = ranked.find((unit) => reasonForUnit(unit, state) === reason && !selected.some((item) => item.unit.id === unit.id || item.unit.topicId === unit.topicId) && canUseMode(unit, selected, ranked));
    if (candidate) add(candidate);
  }
  for (const unit of ranked) {
    if (selected.length >= count) break;
    add(unit);
  }
  return selected;
}

export function selectedUniversityTopicSession(packId: string, unitId: string | null | undefined): UniversityTopicSessionItem[] {
  const unit = unitId ? universityTopicUnitForId(unitId) : null;
  if (!unit || unit.packId !== packId || unit.mode === "reflection") return [];
  return [{ unit, reason: "search_topic" }];
}

export function savedUniversityTopicSession(packId: string, unitId: string | null | undefined, state: UniversityTopicProgressState): UniversityTopicSessionItem[] {
  const unit = unitId && state.savedUnitIds.includes(unitId) ? universityTopicUnitForId(unitId) : null;
  if (!unit || unit.packId !== packId) return [];
  return [{ unit, reason: "saved_topic" }];
}

export function universityTopicSessionReasonLabel(reason: UniversityTopicSessionReason): string {
  return ({ new_topic: "NEW TOPIC", review_topic: "REVIEW THIS TOPIC", saved_topic: "SAVED FOR REVISIT", refresh_topic: "REFRESH THIS TOPIC", search_topic: "SELECTED TOPIC" })[reason];
}

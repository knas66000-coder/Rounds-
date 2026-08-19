import type { HighSchoolLevel, HighSchoolTopicScope } from "./high-school-store";
import type { HighSchoolTopicProgressState } from "./high-school-topic-store";
import { isUnitRecommendedForLevel, topicUnitsForPack, type HighSchoolTopicMode, type HighSchoolTopicUnit } from "../shared/high-school-topic-units";

export type HighSchoolTopicSessionReason = "new_topic" | "review_topic" | "saved_topic" | "refresh_topic";
export type HighSchoolTopicSessionItem = { unit: HighSchoolTopicUnit; reason: HighSchoolTopicSessionReason };

function stableRank(value: string, nonce: number): number {
  let hash = (nonce + 1) * 31;
  for (const character of value) hash = (hash * 33 + character.charCodeAt(0)) >>> 0;
  return hash;
}

function reasonForUnit(unit: HighSchoolTopicUnit, state: HighSchoolTopicProgressState): HighSchoolTopicSessionReason {
  const record = state.records.find((item) => item.unitId === unit.id);
  if (record?.outcome === "review") return "review_topic";
  if (state.savedUnitIds.includes(unit.id)) return "saved_topic";
  if (!record) return "new_topic";
  return "refresh_topic";
}

const priority: Record<HighSchoolTopicSessionReason, number> = {
  new_topic: 0,
  review_topic: 1,
  saved_topic: 2,
  refresh_topic: 3,
};

function canUseMode(candidate: HighSchoolTopicUnit, selected: HighSchoolTopicSessionItem[], candidates: HighSchoolTopicUnit[]): boolean {
  const previousMode = selected.at(-1)?.unit.mode;
  if (!previousMode || candidate.mode !== previousMode) return true;
  return !candidates.some((unit) => unit.id !== candidate.id && !selected.some((item) => item.unit.id === unit.id || item.unit.topicId === unit.topicId) && unit.mode !== previousMode);
}

/**
 * Selects an entirely local, deterministic study session. No unit or topic can
 * repeat in a session; when an alternative exists, consecutive activity modes
 * are avoided. The score intentionally favours unseen learning before review.
 */
export function selectHighSchoolTopicSession(packId: string, level: HighSchoolLevel, state: HighSchoolTopicProgressState, count = 3, nonce = 0, scope: HighSchoolTopicScope = "level_matched"): HighSchoolTopicSessionItem[] {
  const allUnits = topicUnitsForPack(packId);
  const recommended = allUnits.filter((unit) => isUnitRecommendedForLevel(unit, level));
  const candidates = scope === "level_matched" ? recommended : [...recommended, ...allUnits.filter((unit) => !isUnitRecommendedForLevel(unit, level))];
  const ranked = [...candidates].sort((left, right) => {
    const levelDelta = Number(!isUnitRecommendedForLevel(left, level)) - Number(!isUnitRecommendedForLevel(right, level));
    const reasonDelta = priority[reasonForUnit(left, state)] - priority[reasonForUnit(right, state)];
    return levelDelta || reasonDelta || stableRank(left.id, nonce) - stableRank(right.id, nonce);
  });
  const selected: HighSchoolTopicSessionItem[] = [];
  const addUnit = (unit: HighSchoolTopicUnit) => {
    if (selected.length >= count || selected.some((item) => item.unit.id === unit.id || item.unit.topicId === unit.topicId) || !canUseMode(unit, selected, ranked)) return;
    selected.push({ unit, reason: reasonForUnit(unit, state) });
  };
  // Reserve review and saved work before filling with new learning. A broader
  // session keeps one place open for an eligible alternate-band topic when possible.
  for (const reason of ["review_topic", "saved_topic", "new_topic", "refresh_topic"] as const) {
    if (scope === "broadened" && selected.length >= count - 1) break;
    const candidate = ranked.find((unit) => reasonForUnit(unit, state) === reason && !selected.some((item) => item.unit.id === unit.id || item.unit.topicId === unit.topicId) && canUseMode(unit, selected, ranked));
    if (candidate) addUnit(candidate);
  }
  if (scope === "broadened" && selected.length < count && !selected.some((item) => !isUnitRecommendedForLevel(item.unit, level))) {
    const alternateBandCandidate = ranked.find((unit) => !isUnitRecommendedForLevel(unit, level) && !selected.some((item) => item.unit.id === unit.id || item.unit.topicId === unit.topicId) && canUseMode(unit, selected, ranked));
    if (alternateBandCandidate) addUnit(alternateBandCandidate);
  }
  for (const unit of ranked) {
    if (selected.length >= count) break;
    addUnit(unit);
  }
  return selected;
}

export function highSchoolTopicSessionReasonLabel(reason: HighSchoolTopicSessionReason): string {
  return ({ new_topic: "NEW TOPIC", review_topic: "REVIEW THIS TOPIC", saved_topic: "SAVED FOR REVISIT", refresh_topic: "REFRESH THIS TOPIC" })[reason];
}

export function highSchoolTopicSessionModes(session: HighSchoolTopicSessionItem[]): HighSchoolTopicMode[] {
  return session.map((item) => item.unit.mode);
}

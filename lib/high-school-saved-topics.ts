import type { HighSchoolTopicProgressState } from "./high-school-topic-store";
import { topicUnitForId, type HighSchoolTopicUnit } from "../shared/high-school-topic-units";

/**
 * Returns only the selected pack's saved units, newest saved first. The source
 * is on-device progress state; no saved topics, notes, or choices are shared.
 */
export function savedHighSchoolTopicsForPack(packId: string, state: HighSchoolTopicProgressState): HighSchoolTopicUnit[] {
  return [...state.savedUnitIds].reverse().flatMap((unitId) => {
    const unit = topicUnitForId(unitId);
    return unit?.packId === packId ? [unit] : [];
  });
}

import { universityTopicUnitsForPack, type UniversityTopicUnit } from "../shared/university-topic-units";

export function normalizeUniversityTopicSearch(value: string): string {
  return value.trim().toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

export function searchUniversityTopics(packId: string, query: string): UniversityTopicUnit[] {
  const normalized = normalizeUniversityTopicSearch(query);
  if (normalized.length < 2) return [];
  const terms = normalized.split(" ").filter(Boolean);
  return universityTopicUnitsForPack(packId).filter((unit) => unit.mode !== "reflection" && terms.every((term) => normalizeUniversityTopicSearch(`${unit.title} ${unit.cue} ${unit.prompt}`).includes(term)));
}

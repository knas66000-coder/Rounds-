import { topicUnitsForPack, type HighSchoolTopicUnit } from "../shared/high-school-topic-units";

export type HighSchoolTopicSearchResult = {
  unit: HighSchoolTopicUnit;
  score: number;
};

export function normalizeHighSchoolTopicSearch(value: string): string {
  return value.normalize("NFKD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * Searches only original local direct-topic units in the selected subject pack.
 * Reflection companions are deliberately excluded to prevent duplicate results.
 */
export function searchHighSchoolTopics(packId: string, rawQuery: string, limit = 12): HighSchoolTopicSearchResult[] {
  const query = normalizeHighSchoolTopicSearch(rawQuery);
  const terms = query.split(/[^\p{L}\p{N}]+/u).filter((term) => term.length >= 2);
  if (!terms.length) return [];

  return topicUnitsForPack(packId)
    .filter((unit) => unit.mode !== "reflection")
    .map((unit) => {
      const title = normalizeHighSchoolTopicSearch(unit.title);
      const topicId = normalizeHighSchoolTopicSearch(unit.topicId);
      const cue = normalizeHighSchoolTopicSearch(unit.cue);
      const prompt = normalizeHighSchoolTopicSearch(unit.prompt);
      const termScore = terms.reduce((score, term) => score + (title.includes(term) ? 6 : 0) + (topicId.includes(term) ? 5 : 0) + (cue.includes(term) ? 3 : 0) + (prompt.includes(term) ? 1 : 0), 0);
      const phraseScore = title.includes(query) ? 10 : topicId.includes(query) ? 8 : cue.includes(query) ? 4 : prompt.includes(query) ? 2 : 0;
      return { unit, score: termScore + phraseScore };
    })
    .filter((result) => result.score > 0)
    .sort((left, right) => right.score - left.score || left.unit.title.localeCompare(right.unit.title))
    .slice(0, Math.max(1, limit));
}

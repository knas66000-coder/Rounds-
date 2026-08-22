export type DocumentPassage = {
  id: string;
  page: number;
  text: string;
  normalizedText: string;
};

export type LocalDocument = {
  id: string;
  title: string;
  kind: "pdf" | "text" | "markdown";
  pageCount: number;
  importedAt: number;
  passages: DocumentPassage[];
};

export type SearchResult = {
  passage: DocumentPassage;
  score: number;
  excerpt: string;
  matchedTerms: string[];
};

export function normalizeSearchText(value: string): string {
  return value
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function splitIntoPassages(pageText: string, page: number): DocumentPassage[] {
  const cleanText = pageText.replace(/\r/g, "").replace(/[ \t]+\n/g, "\n").trim();
  if (!cleanText) return [];

  const chunks = cleanText
    .split(/\n\s*\n|(?<=[.!?])\s+(?=[A-Z])/g)
    .map((chunk) => chunk.replace(/\s+/g, " ").trim())
    .filter((chunk) => chunk.length >= 12);

  const source = chunks.length > 0 ? chunks : [cleanText];
  return source.map((text, index) => ({
    id: `page-${page}-passage-${index + 1}`,
    page,
    text,
    normalizedText: normalizeSearchText(text),
  }));
}

export function createLocalDocument(input: {
  title: string;
  kind: LocalDocument["kind"];
  pages: string[];
}): LocalDocument {
  const passages = input.pages.flatMap((pageText, index) => splitIntoPassages(pageText, index + 1));

  return {
    id: `${Date.now()}-${input.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`,
    title: input.title,
    kind: input.kind,
    pageCount: input.pages.length,
    importedAt: Date.now(),
    passages,
  };
}

function phraseOccurrences(text: string, phrase: string): number {
  if (!phrase) return 0;
  let occurrences = 0;
  let startAt = 0;
  while (true) {
    const foundAt = text.indexOf(phrase, startAt);
    if (foundAt === -1) return occurrences;
    occurrences += 1;
    startAt = foundAt + phrase.length;
  }
}

function makeExcerpt(text: string, terms: string[]): string {
  const normalized = text.toLocaleLowerCase();
  const firstTerm = terms.find((term) => normalized.includes(term));
  if (!firstTerm) return text.length > 190 ? `${text.slice(0, 187).trim()}…` : text;

  const matchAt = normalized.indexOf(firstTerm);
  const start = Math.max(0, matchAt - 70);
  const end = Math.min(text.length, matchAt + firstTerm.length + 120);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < text.length ? "…" : "";
  return `${prefix}${text.slice(start, end).trim()}${suffix}`;
}

export function searchLocalDocument(document: LocalDocument, query: string, limit = 8): SearchResult[] {
  const normalizedQuery = normalizeSearchText(query);
  const terms = [...new Set(normalizedQuery.split(" ").filter((term) => term.length >= 2))];
  if (!normalizedQuery || terms.length === 0) return [];

  return document.passages
    .map((passage) => {
      const phraseHits = phraseOccurrences(passage.normalizedText, normalizedQuery);
      const matchedTerms = terms.filter((term) => passage.normalizedText.includes(term));
      const relevanceScore = phraseHits * 30 + matchedTerms.length * 5;
      const score = relevanceScore > 0 ? relevanceScore + (passage.page === 1 ? 0.2 : 0) : 0;
      return {
        passage,
        score,
        excerpt: makeExcerpt(passage.text, matchedTerms),
        matchedTerms,
      };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || a.passage.page - b.passage.page)
    .slice(0, limit);
}

export type ReaderCommand =
  | { type: "search"; query: string }
  | { type: "readPage"; page: number }
  | { type: "nextResult" }
  | { type: "previousResult" }
  | { type: "continue" }
  | { type: "stop" }
  | { type: "unknown" };

export function resolveReaderCommand(request: string): ReaderCommand {
  const normalized = normalizeSearchText(request);
  const pageMatch = normalized.match(/(?:read|go to|open) page (\d+)/);
  if (pageMatch) return { type: "readPage", page: Number(pageMatch[1]) };
  if (/(next result|next match)/.test(normalized)) return { type: "nextResult" };
  if (/(previous result|previous match|back)/.test(normalized)) return { type: "previousResult" };
  if (/(continue|keep reading)/.test(normalized)) return { type: "continue" };
  if (/\b(stop|pause|be quiet)\b/.test(normalized)) return { type: "stop" };

  const searchMatch = normalized.match(/(?:search(?: for)?|find|look for) (.+)/);
  if (searchMatch?.[1]) return { type: "search", query: searchMatch[1] };
  return { type: "unknown" };
}

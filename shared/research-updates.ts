export const TRUSTED_RESEARCH_DOMAINS = ["ncsbn.org", "cdc.gov", "fda.gov", "who.int", "nih.gov"] as const;

export type ResearchSource = { title: string; url: string };
export type ResearchUpdate = { headline: string; summary: string; sources: ResearchSource[]; safetyNote: string };

export function researchTopicProblem(topic: string): string | null {
  const value = topic.trim().replace(/\s+/g, " ");
  if (value.length < 3 || value.length > 160) return "Enter a nursing or public-health topic using 3 to 160 characters.";
  if (/\b(my symptoms|my patient|patient name|medical record|diagnose me|diagnosis for me)\b/i.test(value)) return "Search a broad nursing topic without patient details or a request for personal medical advice.";
  return null;
}

export function isTrustedResearchUrl(value: string): boolean {
  try {
    const hostname = new URL(value).hostname.toLowerCase();
    return TRUSTED_RESEARCH_DOMAINS.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, max) : "";

export function normalizeResearchUpdate(value: unknown): ResearchUpdate | null {
  if (!value || typeof value !== "object") return null;
  const record = value as { headline?: unknown; summary?: unknown; sources?: unknown };
  const headline = clean(record.headline, 180);
  const summary = clean(record.summary, 700);
  if (!headline || !summary || !Array.isArray(record.sources)) return null;
  const sources = record.sources.flatMap((source): ResearchSource[] => {
    if (!source || typeof source !== "object") return [];
    const item = source as { title?: unknown; url?: unknown };
    const title = clean(item.title, 180);
    const url = clean(item.url, 1000);
    return title && isTrustedResearchUrl(url) ? [{ title, url }] : [];
  }).slice(0, 3);
  if (!sources.length) return null;
  return { headline, summary, sources, safetyNote: "Research update — verify with your course guidance and local policy. This does not replace the installed Rounds rationale or clinical judgment." };
}

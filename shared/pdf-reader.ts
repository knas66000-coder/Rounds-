export type ReadingSection = { position: number; heading: string; content: string };

export const PDF_READER_MAX_SECTIONS = 160;
const TARGET_SECTION_LENGTH = 1_550;
const STOP_WORDS = new Set(["a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "in", "is", "of", "on", "or", "the", "to", "with"]);

export function normalizePdfText(value: string) {
  return value
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/([A-Za-z])-[ \t]*\n[ \t]*([a-z])/g, "$1$2")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function headingFor(content: string, position: number) {
  const firstLine = content.split("\n")[0]?.trim() ?? "";
  const words = firstLine.split(/\s+/).filter(Boolean);
  if (words.length > 1 && words.length <= 12 && firstLine.length <= 96) return firstLine;
  return `Reading section ${position + 1}`;
}

function splitLongParagraph(paragraph: string) {
  if (paragraph.length <= TARGET_SECTION_LENGTH) return [paragraph];
  const sentences = paragraph.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((sentence) => sentence.trim()).filter(Boolean) ?? [paragraph];
  const pieces: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    if (current && current.length + sentence.length + 1 > TARGET_SECTION_LENGTH) { pieces.push(current); current = sentence; }
    else current = current ? `${current} ${sentence}` : sentence;
  }
  if (current) pieces.push(current);
  return pieces;
}

export function sectionPdfText(rawText: string): ReadingSection[] {
  const normalized = normalizePdfText(rawText);
  if (!normalized) return [];
  const paragraphs = normalized.split(/\n\s*\n/).flatMap(splitLongParagraph).map((paragraph) => paragraph.trim()).filter((paragraph) => paragraph.length >= 24);
  const sections: string[] = [];
  let current = "";
  for (const paragraph of paragraphs) {
    if (current && current.length + paragraph.length + 2 > TARGET_SECTION_LENGTH) { sections.push(current); current = paragraph; }
    else current = current ? `${current}\n\n${paragraph}` : paragraph;
  }
  if (current) sections.push(current);
  return sections.slice(0, PDF_READER_MAX_SECTIONS).map((content, position) => ({ position, heading: headingFor(content, position), content }));
}

export function searchReadingSections(sections: ReadingSection[], rawQuery: string) {
  const normalizedQuery = rawQuery.trim().toLocaleLowerCase();
  const terms = normalizedQuery.split(/[^\p{L}\p{N}]+/u).filter((term) => term.length >= 2 && !STOP_WORDS.has(term));
  if (!terms.length) return [];
  return sections.map((section) => {
    const body = section.content.toLocaleLowerCase();
    const heading = section.heading.toLocaleLowerCase();
    const termScore = terms.reduce((score, term) => score + (body.match(new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"))?.length ?? 0) + (heading.includes(term) ? 3 : 0), 0);
    const phraseScore = normalizedQuery.length > 2 && body.includes(normalizedQuery) ? 6 : 0;
    return { ...section, score: termScore + phraseScore };
  }).filter((section) => section.score > 0).sort((a, b) => b.score - a.score || a.position - b.position).slice(0, 18);
}

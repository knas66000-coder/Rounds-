import { sectionPdfText, type ReadingSection } from "../shared/pdf-reader";

// The package root executes a bundled sample when loaded by Vitest; use the parser module directly.
const pdf = require("pdf-parse/lib/pdf-parse.js") as (content: Buffer) => Promise<{ text?: string }>;

export async function extractPdfReadingSections(content: Buffer): Promise<ReadingSection[]> {
  const parsed = await pdf(content);
  return sectionPdfText(parsed.text ?? "");
}

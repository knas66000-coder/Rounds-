import { sectionPdfText, type ReadingSection } from "../shared/pdf-reader";

type PdfParser = (content: Buffer) => Promise<{ text?: string }>;

/**
 * Load the parser only when a learner opens or indexes a PDF. Importing the
 * parser module directly avoids the package-root sample behavior in Vitest,
 * while `import()` remains valid in the production ESM server bundle.
 */
async function getPdfParser(): Promise<PdfParser> {
  const parserModulePath = "pdf-parse/lib/pdf-parse.js";
  const module = await import(parserModulePath);
  return (module.default ?? module) as PdfParser;
}

export async function extractPdfReadingSections(content: Buffer): Promise<ReadingSection[]> {
  const pdf = await getPdfParser();
  const parsed = await pdf(content);
  return sectionPdfText(parsed.text ?? "");
}

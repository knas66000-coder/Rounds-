import { describe, expect, it } from "vitest";
import { normalizePdfText, searchReadingSections, sectionPdfText } from "../shared/pdf-reader";

describe("Rounds PDF Reader indexing", () => {
  it("normalizes hyphenated line wrapping and produces compact reading sections", () => {
    const text = normalizePdfText("Cardio-\nvascular assessment is essential.\n\nAssess heart sounds and circulation.");
    expect(text).toContain("Cardiovascular assessment");
    const sections = sectionPdfText(text);
    expect(sections).toHaveLength(1);
    expect(sections[0]?.content).toContain("heart sounds");
  });

  it("ranks topic-relevant passages above unrelated text", () => {
    const sections = sectionPdfText("Respiratory care\n\nAssess oxygen saturation and work of breathing.\n\nMedication safety\n\nVerify a medication order before administration.");
    const results = searchReadingSections(sections, "oxygen breathing");
    expect(results[0]?.content).toContain("oxygen saturation");
    expect(searchReadingSections(sections, "the and")).toEqual([]);
  });
});

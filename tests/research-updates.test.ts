import { describe, expect, it } from "vitest";
import { isTrustedResearchUrl, normalizeResearchUpdate, researchTopicProblem } from "../shared/research-updates";

describe("Research Updates safety", () => {
  it("accepts broad Nursing topics and rejects personal-health prompts", () => {
    expect(researchTopicProblem("infection prevention guidance")).toBeNull();
    expect(researchTopicProblem("diagnose me from my symptoms")).toContain("personal medical advice");
  });

  it("allows only approved official source URLs", () => {
    expect(isTrustedResearchUrl("https://www.cdc.gov/infection-control/")).toBe(true);
    expect(isTrustedResearchUrl("https://example.com/cdc.gov")).toBe(false);
  });

  it("keeps only validated cited sources in a research update", () => {
    const update = normalizeResearchUpdate({ headline: "CDC update", summary: "A concise educational summary.", sources: [{ title: "CDC source", url: "https://www.cdc.gov/infection-control/" }, { title: "Untrusted", url: "https://example.com/" }] });
    expect(update?.sources).toEqual([{ title: "CDC source", url: "https://www.cdc.gov/infection-control/" }]);
  });
});

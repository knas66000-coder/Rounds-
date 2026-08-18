import { describe, expect, it } from "vitest";
import { caseChainForPack } from "../shared/case-chains";
import { advanceCaseStep, createCaseChainProgress, finishCaseChain, parseCaseChainStore, recordCaseDecision } from "../lib/case-chain-store";

describe("Rounds multi-step case chains", () => {
  it("gives every active non-Nursing pack a two-step subject-specific case chain", () => {
    const packs = ["university-foundation-year", "computing-foundations", "business-foundations", "engineering-foundations", "natural-sciences-foundations", "education-foundations", "social-sciences-foundations"];
    expect(packs.every((packId) => (caseChainForPack(packId)?.steps.length ?? 0) >= 2)).toBe(true);
  });

  it("records a decision before allowing a learner to advance to the next linked step", () => {
    const chain = caseChainForPack("computing-foundations");
    if (!chain) throw new Error("Missing computing case chain");
    const blank = createCaseChainProgress(chain.id);
    expect(advanceCaseStep(blank, chain).activeStepIndex).toBe(0);
    const answered = recordCaseDecision(blank, chain.steps[0].id, chain.steps[0].bestOption);
    expect(advanceCaseStep(answered, chain).activeStepIndex).toBe(1);
  });

  it("keeps reflection private and rejects malformed saved state", () => {
    const complete = finishCaseChain({ ...createCaseChainProgress("example"), activeStepIndex: 2 }, " I will test the requirement early. ", new Date("2026-08-18T00:00:00.000Z"));
    expect(complete.reflection).toBe("I will test the requirement early.");
    expect(complete.completedAt).toBe("2026-08-18T00:00:00.000Z");
    expect(parseCaseChainStore('{"bad":{"chainId":"other"}}')).toEqual({});
  });
});

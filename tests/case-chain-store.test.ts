import { describe, expect, it } from "vitest";
import { COURSE_CASE_CHAINS, caseChainForPack } from "../shared/case-chains";
import { advanceCaseStep, createCaseChainProgress, finishCaseChain, parseCaseChainStore, recordCaseDecision, reflectionSummaryForProgress } from "../lib/case-chain-store";

describe("Rounds multi-step case chains", () => {
  it("gives every active non-Nursing pack a two-step subject-specific case chain", () => {
    const packs = ["university-foundation-year", "computing-foundations", "business-foundations", "engineering-foundations", "natural-sciences-foundations", "education-foundations", "social-sciences-foundations", "uganda-high-school-biology", "uganda-high-school-chemistry", "uganda-high-school-economics", "uganda-high-school-entrepreneurship", "uganda-high-school-english"];
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

  it("uses an explicit finite branch target when a case step defines one", () => {
    const chain = caseChainForPack("computing-foundations");
    if (!chain) throw new Error("Missing computing case chain");
    const first = chain.steps[0];
    const alternate = recordCaseDecision(createCaseChainProgress(chain.id), first.id, "Treat them as decoration to add after launch.");
    expect(chain.steps[advanceCaseStep(alternate, chain).activeStepIndex]?.id).toBe("requirements-repair");
  });

  it("routes a non-best first decision in every active case to a finite repair step", () => {
    expect(COURSE_CASE_CHAINS).toHaveLength(12);

    for (const chain of COURSE_CASE_CHAINS) {
      const first = chain.steps[0];
      const nonBestOption = first.options.find((option) => option !== first.bestOption);
      if (!nonBestOption) throw new Error(`Missing alternate decision for ${chain.id}`);
      const declaredRepairStepId = first.nextStepByOption?.[nonBestOption];
      const declaredNormalStepId = first.nextStepByOption?.[first.bestOption];
      if (!declaredRepairStepId || !declaredNormalStepId) throw new Error(`Missing declared branch target for ${chain.id}`);

      const next = advanceCaseStep(
        recordCaseDecision(createCaseChainProgress(chain.id), first.id, nonBestOption),
        chain,
      );
      const repairStep = chain.steps[next.activeStepIndex];

      expect(repairStep?.id).toBe(declaredRepairStepId);
      expect(repairStep?.id).not.toBe(declaredNormalStepId);
      expect(repairStep?.nextStepByOption).toBeUndefined();
    }
  });

  it("keeps reflection private and rejects malformed saved state", () => {
    const complete = finishCaseChain({ ...createCaseChainProgress("example"), activeStepIndex: 2 }, " I will test the requirement early. ", new Date("2026-08-18T00:00:00.000Z"));
    expect(complete.reflection).toBe("I will test the requirement early.");
    expect(complete.completedAt).toBe("2026-08-18T00:00:00.000Z");
    expect(reflectionSummaryForProgress({ ...complete, decisions: { privateStep: "private answer" } })).toEqual({ chainId: "example", reflection: "I will test the requirement early.", completedAt: "2026-08-18T00:00:00.000Z" });
    expect(parseCaseChainStore('{"bad":{"chainId":"other"}}')).toEqual({});
  });
});

import { describe, expect, it } from "vitest";
import { questionBank } from "../data/questionBank";
import { buildAdaptiveQueue, buildExamReview, priorityFor, remediationItems, upsertLearningSignal } from "../lib/adaptive";

describe("adaptive review", () => {
  it("prioritizes missed responses above partial, flagged, and saved questions", () => {
    const signals = upsertLearningSignal([], "nur-001", "incorrect", "2026-08-16T00:00:00.000Z");
    const queue = buildAdaptiveQueue(questionBank, signals, ["nur-002"], 5);
    expect(queue[0].question.id).toBe("nur-001");
    expect(queue[0].reasons).toContain("missed");
    expect(new Set(queue.map((item) => item.question.id)).size).toBe(queue.length);
  });

  it("records distinct evidence when a question is partial or flagged", () => {
    const partial = upsertLearningSignal([], "nur-003", "partial", "2026-08-16T00:00:00.000Z", true)[0];
    expect(priorityFor(partial, false).reasons).toEqual(["partial", "flagged"]);
  });

  it("creates remediation lists with unanswered and incorrect items first", () => {
    const items = buildExamReview(questionBank.slice(0, 3), { "nur-001": "something else", "nur-002": questionBank[1].keys.join(" ") }, ["nur-002"]);
    const remediation = remediationItems(items);
    expect(remediation[0].outcome).toBe("unanswered");
    expect(remediation.some((item) => item.flagged)).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { questionBank } from "../data/questionBank";
import { createMockExamQueue, remainingSeconds, summarizeMockExam } from "../lib/mock-exam";

describe("mock exam logic", () => {
  it("selects a non-repeating question queue with the requested size", () => {
    const queue = createMockExamQueue(questionBank, 25);
    expect(queue).toHaveLength(25);
    expect(new Set(queue.map((question) => question.id)).size).toBe(25);
  });

  it("never returns a negative countdown", () => {
    expect(remainingSeconds(1000, 2000)).toBe(0);
    expect(remainingSeconds(2000, 1001)).toBe(1);
  });

  it("reports unanswered responses separately from scored answers", () => {
    const queue = questionBank.slice(0, 2);
    const results = summarizeMockExam(queue, { [queue[0].id]: queue[0].keys.join(" ") });
    expect(results.correct).toBe(1);
    expect(results.unanswered).toBe(1);
  });
});

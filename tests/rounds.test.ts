import { describe, expect, it } from "vitest";
import { evaluateAnswer } from "../lib/rounds";
import { questionBank } from "../data/questionBank";

describe("evaluateAnswer", () => {
  const item = questionBank.find((question) => question.id === "fund-hr")!;
  it("marks an answer correct when at least 60 percent of keywords match", () => {
    expect(evaluateAnswer("The normal range is 60 to 100 beats per minute", item).verdict).toBe("correct");
  });
  it("marks an answer partial when some keywords match", () => {
    expect(evaluateAnswer("The normal range begins at 60", item).verdict).toBe("partial");
  });
  it("marks an answer incorrect when no keywords match", () => {
    expect(evaluateAnswer("A normal adult rate is 120", item).verdict).toBe("incorrect");
  });
});

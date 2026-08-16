import { describe, expect, it } from "vitest";
import { hasAnotherQuestion, nextStepForVerdict, questionsForCategory } from "../lib/session";

describe("focused practice session helpers", () => {
  it("returns only questions from a selected category", () => {
    const questions = questionsForCategory("Cardiac");
    expect(questions.length).toBeGreaterThan(0);
    expect(questions.every((question) => question.cat === "Cardiac")).toBe(true);
  });

  it("returns actionable next-step guidance for each verdict", () => {
    expect(nextStepForVerdict("correct")).toContain("Continue");
    expect(nextStepForVerdict("partial")).toContain("key terms");
    expect(nextStepForVerdict("incorrect")).toContain("clinical reasoning");
  });

  it("does not wrap a completed question queue back to its first item", () => {
    expect(hasAnotherQuestion(4, 5)).toBe(false);
    expect(hasAnotherQuestion(3, 5)).toBe(true);
  });
});

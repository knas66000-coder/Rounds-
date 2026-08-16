import { describe, expect, it } from "vitest";
import { nextStepForVerdict, questionsForCategory } from "../lib/session";

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
});

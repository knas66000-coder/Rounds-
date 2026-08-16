import { describe, expect, it } from "vitest";
import importedBank from "../data/question_bank_1000.json";

describe("imported 1,000-question nursing bank", () => {
  it("contains one complete and uniquely identified answered record for every source question", () => {
    expect(importedBank.questions).toHaveLength(1000);
    expect(new Set(importedBank.questions.map((question) => question.id)).size).toBe(1000);
    expect(importedBank.questions.every((question) => question.q && question.a && question.keys.length >= 2)).toBe(true);
  });

  it("does not repeat the same normalized question text", () => {
    const normalize = (question: string) => question.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
    const prompts = importedBank.questions.map((question) => normalize(question.q));
    expect(new Set(prompts).size).toBe(importedBank.questions.length);
  });
});

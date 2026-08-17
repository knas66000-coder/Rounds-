import { describe, expect, it } from "vitest";
import type { Question } from "../data/questionBank";
import { buildOralExamQueue, matchOralExamTopic, oralExamFollowUpPrompt, selectOralExamFollowUp } from "../lib/oral-exam";

const questions: Question[] = [
  { id: "a", cat: "Cardiac", q: "Question A", a: "Answer", keys: ["assess", "perfusion"], context: "", explanation: "", clinicalSignificance: "", relatedConcepts: [] },
  { id: "b", cat: "Cardiac", q: "Question B", a: "Answer", keys: ["perfusion", "monitor"], context: "", explanation: "", clinicalSignificance: "", relatedConcepts: [] },
  { id: "c", cat: "Cardiac", q: "Question C", a: "Answer", keys: ["oxygen", "monitor"], context: "", explanation: "", clinicalSignificance: "", relatedConcepts: [] },
  { id: "d", cat: "Respiratory", q: "Question D", a: "Answer", keys: ["oxygen"], context: "", explanation: "", clinicalSignificance: "", relatedConcepts: [] },
];

describe("oral exam utilities", () => {
  it("matches common spoken topic aliases", () => {
    expect(matchOralExamTopic("I want cardiac questions", ["Cardiac", "Respiratory"])).toBe("Cardiac");
    expect(matchOralExamTopic("let us practise psych", ["Mental Health", "Respiratory"])).toBe("Mental Health");
  });

  it("builds a unique topic-only queue", () => {
    const queue = buildOralExamQueue(questions, "Cardiac", 2);
    expect(queue.map((question) => question.id)).toEqual(["a", "b"]);
    expect(new Set(queue.map((question) => question.id)).size).toBe(queue.length);
  });

  it("selects an unserved same-topic follow-up for a missing key", () => {
    expect(selectOralExamFollowUp(questions[0], ["assess"], questions.slice(1))?.id).toBe("b");
    expect(oralExamFollowUpPrompt(["assess"], questions[0])).toContain("perfusion");
  });
});

import type { Question } from "../data/questionBank";
import { evaluateAnswer, shuffle, type Verdict } from "./rounds";

export const MOCK_EXAM_QUESTION_COUNT = 25;
export const MOCK_EXAM_DURATION_SECONDS = 60 * 60;

export type MockExamSummary = {
  correct: number;
  partial: number;
  incorrect: number;
  unanswered: number;
  score: number;
};

export function createMockExamQueue(questionBank: Question[], count = MOCK_EXAM_QUESTION_COUNT): Question[] {
  return shuffle(questionBank).slice(0, Math.min(count, questionBank.length));
}

export function remainingSeconds(deadline: number, now: number): number {
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}

export function summarizeMockExam(questions: Question[], answers: Record<string, string>): MockExamSummary {
  const verdicts: (Verdict | "unanswered")[] = questions.map((question) => {
    const answer = answers[question.id]?.trim();
    return answer ? evaluateAnswer(answer, question).verdict : "unanswered";
  });
  const correct = verdicts.filter((verdict) => verdict === "correct").length;
  const partial = verdicts.filter((verdict) => verdict === "partial").length;
  const incorrect = verdicts.filter((verdict) => verdict === "incorrect").length;
  const unanswered = verdicts.filter((verdict) => verdict === "unanswered").length;
  return { correct, partial, incorrect, unanswered, score: questions.length ? Math.round((correct / questions.length) * 100) : 0 };
}

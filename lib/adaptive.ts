import type { Question } from "../data/questionBank";
import { evaluateAnswer, type Verdict } from "./rounds";

export const LEARNING_SIGNALS_KEY = "rounds.learning-signals.v1";

export type LearningSignal = {
  questionId: string;
  incorrectCount: number;
  partialCount: number;
  flaggedCount: number;
  lastVerdict?: Verdict;
  lastReviewedAt: string;
};

export type ReviewReason = "missed" | "partial" | "flagged" | "saved";
export type AdaptiveItem = { question: Question; priority: number; reasons: ReviewReason[] };
export type ExamOutcome = Verdict | "unanswered";
export type ExamReviewItem = { question: Question; answer: string; outcome: ExamOutcome; flagged: boolean };

export function parseLearningSignals(value: string | null): LearningSignal[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as LearningSignal[];
    return Array.isArray(parsed) ? parsed.filter((signal) => typeof signal?.questionId === "string") : [];
  } catch {
    return [];
  }
}

export function upsertLearningSignal(signals: LearningSignal[], questionId: string, verdict: Verdict, now = new Date().toISOString(), flagged = false): LearningSignal[] {
  const prior = signals.find((signal) => signal.questionId === questionId);
  const next: LearningSignal = {
    questionId,
    incorrectCount: (prior?.incorrectCount ?? 0) + (verdict === "incorrect" ? 1 : 0),
    partialCount: (prior?.partialCount ?? 0) + (verdict === "partial" ? 1 : 0),
    flaggedCount: (prior?.flaggedCount ?? 0) + (flagged ? 1 : 0),
    lastVerdict: verdict,
    lastReviewedAt: now,
  };
  return [next, ...signals.filter((signal) => signal.questionId !== questionId)];
}

export function priorityFor(signal: LearningSignal | undefined, isBookmarked: boolean): { priority: number; reasons: ReviewReason[] } {
  const reasons: ReviewReason[] = [];
  let priority = 0;
  if (signal?.incorrectCount) { priority += signal.incorrectCount * 60; reasons.push("missed"); }
  if (signal?.partialCount) { priority += signal.partialCount * 35; reasons.push("partial"); }
  if (signal?.flaggedCount) { priority += signal.flaggedCount * 25; reasons.push("flagged"); }
  if (isBookmarked) { priority += 20; reasons.push("saved"); }
  return { priority, reasons };
}

export function buildAdaptiveQueue(questionBank: Question[], signals: LearningSignal[], bookmarkedIds: string[], limit = 25): AdaptiveItem[] {
  const signalsById = new Map(signals.map((signal) => [signal.questionId, signal]));
  const bookmarked = new Set(bookmarkedIds);
  return questionBank
    .map((question) => ({ question, ...priorityFor(signalsById.get(question.id), bookmarked.has(question.id)) }))
    .filter((item) => item.priority > 0)
    .sort((a, b) => b.priority - a.priority || a.question.id.localeCompare(b.question.id))
    .slice(0, limit);
}

export function buildExamReview(questions: Question[], answers: Record<string, string>, flaggedIds: string[]): ExamReviewItem[] {
  const flagged = new Set(flaggedIds);
  return questions.map((question) => {
    const answer = answers[question.id]?.trim() ?? "";
    return { question, answer, outcome: answer ? evaluateAnswer(answer, question).verdict : "unanswered", flagged: flagged.has(question.id) };
  });
}

export function remediationItems(items: ExamReviewItem[]): ExamReviewItem[] {
  const priority = { unanswered: 4, incorrect: 3, partial: 2, correct: 1 } as const;
  return [...items].filter((item) => item.outcome !== "correct" || item.flagged).sort((a, b) => (priority[b.outcome] + (b.flagged ? 1 : 0)) - (priority[a.outcome] + (a.flagged ? 1 : 0)));
}

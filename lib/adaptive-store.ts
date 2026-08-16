import AsyncStorage from "@react-native-async-storage/async-storage";
import { LEARNING_SIGNALS_KEY, parseLearningSignals, upsertLearningSignal, type ExamReviewItem, type LearningSignal } from "./adaptive";
import type { Verdict } from "./rounds";

export const EXAM_REMEDIATION_KEY = "rounds.exam-remediation.v1";

export async function getLearningSignals(): Promise<LearningSignal[]> {
  return parseLearningSignals(await AsyncStorage.getItem(LEARNING_SIGNALS_KEY));
}

export async function recordLearningOutcome(questionId: string, verdict: Verdict, flagged = false): Promise<LearningSignal[]> {
  const next = upsertLearningSignal(await getLearningSignals(), questionId, verdict, new Date().toISOString(), flagged);
  await AsyncStorage.setItem(LEARNING_SIGNALS_KEY, JSON.stringify(next));
  return next;
}

export async function recordExamOutcomes(items: ExamReviewItem[]): Promise<LearningSignal[]> {
  let next = await getLearningSignals();
  const now = new Date().toISOString();
  for (const item of items) {
    const verdict: Verdict = item.outcome === "unanswered" ? "incorrect" : item.outcome;
    next = upsertLearningSignal(next, item.question.id, verdict, now, item.flagged);
  }
  await AsyncStorage.setItem(LEARNING_SIGNALS_KEY, JSON.stringify(next));
  return next;
}

export async function saveExamRemediationQuestionIds(questionIds: string[]): Promise<void> {
  const uniqueIds = [...new Set(questionIds)];
  await AsyncStorage.setItem(EXAM_REMEDIATION_KEY, JSON.stringify(uniqueIds));
}

export async function getExamRemediationQuestionIds(): Promise<string[]> {
  try {
    const value = await AsyncStorage.getItem(EXAM_REMEDIATION_KEY);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

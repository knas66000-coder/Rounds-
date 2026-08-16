import AsyncStorage from "@react-native-async-storage/async-storage";
import { LEARNING_SIGNALS_KEY, parseLearningSignals, upsertLearningSignal, type LearningSignal } from "./adaptive";
import type { Verdict } from "./rounds";

export async function getLearningSignals(): Promise<LearningSignal[]> {
  return parseLearningSignals(await AsyncStorage.getItem(LEARNING_SIGNALS_KEY));
}

export async function recordLearningOutcome(questionId: string, verdict: Verdict, flagged = false): Promise<LearningSignal[]> {
  const next = upsertLearningSignal(await getLearningSignals(), questionId, verdict, new Date().toISOString(), flagged);
  await AsyncStorage.setItem(LEARNING_SIGNALS_KEY, JSON.stringify(next));
  return next;
}

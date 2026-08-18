import AsyncStorage from "@react-native-async-storage/async-storage";
import type { CourseCaseChain } from "@/shared/case-chains";

const CASE_CHAIN_KEY = "rounds.course-case-chains.v1";

export type CaseChainProgress = {
  chainId: string;
  activeStepIndex: number;
  decisions: Record<string, string>;
  reflection: string;
  completedAt?: string;
};

type CaseChainStore = Record<string, CaseChainProgress>;

export function createCaseChainProgress(chainId: string): CaseChainProgress {
  return { chainId, activeStepIndex: 0, decisions: {}, reflection: "" };
}

export function parseCaseChainStore(value: string | null): CaseChainStore {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.entries(parsed as Record<string, unknown>).reduce<CaseChainStore>((result, [chainId, entry]) => {
      if (!entry || typeof entry !== "object") return result;
      const item = entry as Partial<CaseChainProgress>;
      const activeStepIndex = item.activeStepIndex;
      if (item.chainId !== chainId || typeof activeStepIndex !== "number" || !Number.isInteger(activeStepIndex) || activeStepIndex < 0 || !item.decisions || typeof item.decisions !== "object" || Array.isArray(item.decisions) || typeof item.reflection !== "string") return result;
      result[chainId] = { chainId, activeStepIndex, decisions: Object.entries(item.decisions as Record<string, unknown>).reduce<Record<string, string>>((answers, [stepId, answer]) => typeof answer === "string" ? { ...answers, [stepId]: answer } : answers, {}), reflection: item.reflection, ...(typeof item.completedAt === "string" ? { completedAt: item.completedAt } : {}) };
      return result;
    }, {});
  } catch {
    return {};
  }
}

export function recordCaseDecision(progress: CaseChainProgress, stepId: string, answer: string): CaseChainProgress {
  if (!answer.trim() || progress.decisions[stepId]) return progress;
  return { ...progress, decisions: { ...progress.decisions, [stepId]: answer } };
}

export function advanceCaseStep(progress: CaseChainProgress, chain: CourseCaseChain): CaseChainProgress {
  const activeStep = chain.steps[progress.activeStepIndex];
  if (!activeStep || !progress.decisions[activeStep.id]) return progress;
  return { ...progress, activeStepIndex: Math.min(progress.activeStepIndex + 1, chain.steps.length) };
}

export function finishCaseChain(progress: CaseChainProgress, reflection: string, now = new Date()): CaseChainProgress {
  return { ...progress, reflection: reflection.trim(), completedAt: now.toISOString() };
}

export async function loadCaseChainProgress(chainId: string): Promise<CaseChainProgress> {
  const store = parseCaseChainStore(await AsyncStorage.getItem(CASE_CHAIN_KEY));
  return store[chainId] ?? createCaseChainProgress(chainId);
}

export async function saveCaseChainProgress(progress: CaseChainProgress): Promise<void> {
  const store = parseCaseChainStore(await AsyncStorage.getItem(CASE_CHAIN_KEY));
  await AsyncStorage.setItem(CASE_CHAIN_KEY, JSON.stringify({ ...store, [progress.chainId]: progress }));
}

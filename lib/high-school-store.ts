import AsyncStorage from "@react-native-async-storage/async-storage";

import { highSchoolCoursePacks } from "../shared/course-packs";

export const HIGH_SCHOOL_LEVEL_KEY = "rounds.high-school.level.v1";
export const HIGH_SCHOOL_REVISION_KEY = "rounds.high-school.revision.v1";

export const HIGH_SCHOOL_LEVELS = [
  { id: "s1", title: "Senior 1", band: "FOUNDATION" },
  { id: "s2", title: "Senior 2", band: "FOUNDATION" },
  { id: "s3", title: "Senior 3", band: "O-LEVEL PATH" },
  { id: "s4", title: "Senior 4", band: "O-LEVEL PATH" },
  { id: "s5", title: "Senior 5", band: "UPPER SECONDARY" },
  { id: "s6", title: "Senior 6", band: "UPPER SECONDARY" },
] as const;

export type HighSchoolLevel = (typeof HIGH_SCHOOL_LEVELS)[number]["id"];
export type HighSchoolLearningBand = "foundation" | "development" | "extension";
export type HighSchoolRevisionPlan = { focusPackId: string | null; weeklyTarget: 2 | 3 | 4; updatedAt: string | null };

const fallbackRevisionPlan: HighSchoolRevisionPlan = { focusPackId: null, weeklyTarget: 3, updatedAt: null };

export function isHighSchoolLevel(value: string | null | undefined): value is HighSchoolLevel {
  return HIGH_SCHOOL_LEVELS.some((level) => level.id === value);
}

export function parseHighSchoolLevel(value: string | null): HighSchoolLevel {
  return isHighSchoolLevel(value) ? value : "s1";
}

export function parseHighSchoolRevisionPlan(value: string | null): HighSchoolRevisionPlan {
  if (!value) return fallbackRevisionPlan;
  try {
    const candidate = JSON.parse(value) as Partial<HighSchoolRevisionPlan>;
    const knownPack = typeof candidate.focusPackId === "string" && highSchoolCoursePacks().some((pack) => pack.id === candidate.focusPackId);
    const weeklyTarget = candidate.weeklyTarget === 2 || candidate.weeklyTarget === 3 || candidate.weeklyTarget === 4 ? candidate.weeklyTarget : 3;
    return { focusPackId: knownPack ? candidate.focusPackId! : null, weeklyTarget, updatedAt: typeof candidate.updatedAt === "string" ? candidate.updatedAt : null };
  } catch {
    return fallbackRevisionPlan;
  }
}

export async function loadHighSchoolLevel(): Promise<HighSchoolLevel> {
  return parseHighSchoolLevel(await AsyncStorage.getItem(HIGH_SCHOOL_LEVEL_KEY));
}

export async function saveHighSchoolLevel(level: HighSchoolLevel): Promise<HighSchoolLevel> {
  await AsyncStorage.setItem(HIGH_SCHOOL_LEVEL_KEY, level);
  return level;
}

export async function loadHighSchoolRevisionPlan(): Promise<HighSchoolRevisionPlan> {
  return parseHighSchoolRevisionPlan(await AsyncStorage.getItem(HIGH_SCHOOL_REVISION_KEY));
}

export async function saveHighSchoolRevisionPlan(plan: Pick<HighSchoolRevisionPlan, "focusPackId" | "weeklyTarget">): Promise<HighSchoolRevisionPlan> {
  const next: HighSchoolRevisionPlan = { ...plan, updatedAt: new Date().toISOString() };
  await AsyncStorage.setItem(HIGH_SCHOOL_REVISION_KEY, JSON.stringify(next));
  return next;
}

export function highSchoolLevelLabel(level: HighSchoolLevel): string {
  return HIGH_SCHOOL_LEVELS.find((item) => item.id === level)?.title ?? "Senior 1";
}

export function highSchoolLearningBand(level: HighSchoolLevel): HighSchoolLearningBand {
  if (level === "s1" || level === "s2") return "foundation";
  if (level === "s3" || level === "s4") return "development";
  return "extension";
}

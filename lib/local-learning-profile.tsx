import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { academicProfileProblem, isAcademicProgram, type AcademicProgramId } from "../shared/academic-profile";

export const LOCAL_LEARNING_PROFILE_KEY = "rounds.local-learning-profile.v1";

export type LocalLearningProfile = {
  schemaVersion: 1;
  institutionName: string;
  program: AcademicProgramId;
  updatedAt: string;
};

export type LocalLearningProfileInput = Pick<LocalLearningProfile, "institutionName" | "program">;

type LocalLearningProfileContextValue = {
  profile: LocalLearningProfile | null;
  ready: boolean;
  saveProfile: (input: LocalLearningProfileInput) => Promise<LocalLearningProfile>;
  clearProfile: () => Promise<void>;
};

const LocalLearningProfileContext = createContext<LocalLearningProfileContextValue | null>(null);

export function createLocalLearningProfile(input: LocalLearningProfileInput, updatedAt = new Date().toISOString()): LocalLearningProfile {
  const institutionName = input.institutionName.trim();
  const problem = academicProfileProblem({ institutionName, program: input.program });
  if (problem) throw new Error(problem);
  return { schemaVersion: 1, institutionName, program: input.program, updatedAt };
}

export function parseLocalLearningProfile(raw: string | null): LocalLearningProfile | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<LocalLearningProfile>;
    const institutionName = value.institutionName;
    const program = value.program;
    const updatedAt = value.updatedAt;
    if (value.schemaVersion !== 1 || typeof institutionName !== "string" || typeof program !== "string" || !isAcademicProgram(program) || typeof updatedAt !== "string") return null;
    return createLocalLearningProfile({ institutionName, program: program as AcademicProgramId }, updatedAt);
  } catch {
    return null;
  }
}

export async function loadLocalLearningProfile(): Promise<LocalLearningProfile | null> {
  return parseLocalLearningProfile(await AsyncStorage.getItem(LOCAL_LEARNING_PROFILE_KEY));
}

export async function saveLocalLearningProfile(input: LocalLearningProfileInput): Promise<LocalLearningProfile> {
  const profile = createLocalLearningProfile(input);
  await AsyncStorage.setItem(LOCAL_LEARNING_PROFILE_KEY, JSON.stringify(profile));
  return profile;
}

export function LocalLearningProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<LocalLearningProfile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    void loadLocalLearningProfile().then((next) => {
      if (!active) return;
      setProfile(next);
      setReady(true);
    });
    return () => { active = false; };
  }, []);

  const saveProfile = useCallback(async (input: LocalLearningProfileInput) => {
    const next = await saveLocalLearningProfile(input);
    setProfile(next);
    return next;
  }, []);

  const clearProfile = useCallback(async () => {
    await AsyncStorage.removeItem(LOCAL_LEARNING_PROFILE_KEY);
    setProfile(null);
  }, []);

  const value = useMemo(() => ({ profile, ready, saveProfile, clearProfile }), [clearProfile, profile, ready, saveProfile]);
  return <LocalLearningProfileContext.Provider value={value}>{children}</LocalLearningProfileContext.Provider>;
}

export function useLocalLearningProfile(): LocalLearningProfileContextValue {
  const value = useContext(LocalLearningProfileContext);
  if (!value) throw new Error("useLocalLearningProfile must be used inside LocalLearningProfileProvider.");
  return value;
}

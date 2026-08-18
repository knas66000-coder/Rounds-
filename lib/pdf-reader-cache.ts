import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ReadingSection } from "@/shared/pdf-reader";

export type CachedPdfReader = {
  material: { id: number; title: string; mimeType: string; byteSize: number; createdAt: Date | string };
  sections: ReadingSection[];
  cachedAt: string;
};

function baseKey(userId: number, materialId: number) { return `rounds.pdf-reader.v1.${userId}.${materialId}`; }

export async function loadPdfReaderCache(userId: number, materialId: number) {
  const value = await AsyncStorage.getItem(`${baseKey(userId, materialId)}.content`);
  if (!value) return null;
  try { return JSON.parse(value) as CachedPdfReader; } catch { return null; }
}

export async function savePdfReaderCache(userId: number, materialId: number, value: Omit<CachedPdfReader, "cachedAt">) {
  await AsyncStorage.setItem(`${baseKey(userId, materialId)}.content`, JSON.stringify({ ...value, cachedAt: new Date().toISOString() }));
}

export async function loadPdfReaderProgress(userId: number, materialId: number) {
  const [position, saved] = await Promise.all([AsyncStorage.getItem(`${baseKey(userId, materialId)}.position`), AsyncStorage.getItem(`${baseKey(userId, materialId)}.saved`)]);
  return { position: Math.max(0, Number.parseInt(position ?? "0", 10) || 0), saved: new Set<number>((JSON.parse(saved ?? "[]") as unknown[]).filter((value): value is number => typeof value === "number" && Number.isInteger(value) && value >= 0)) };
}

export async function savePdfReaderProgress(userId: number, materialId: number, position: number, saved: Set<number>) {
  await Promise.all([
    AsyncStorage.setItem(`${baseKey(userId, materialId)}.position`, String(Math.max(0, position))),
    AsyncStorage.setItem(`${baseKey(userId, materialId)}.saved`, JSON.stringify([...saved].sort((a, b) => a - b))),
  ]);
}

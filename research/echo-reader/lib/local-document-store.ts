import AsyncStorage from "@react-native-async-storage/async-storage";

import type { LocalDocument } from "./document-search";

export const ACTIVE_DOCUMENT_KEY = "echo-reader.active-document.v1";

export async function loadLocalDocument(): Promise<LocalDocument | null> {
  const storedDocument = await AsyncStorage.getItem(ACTIVE_DOCUMENT_KEY);
  if (!storedDocument) return null;

  const document = JSON.parse(storedDocument) as LocalDocument;
  return document.passages?.length && document.title ? document : null;
}

export async function saveLocalDocument(document: LocalDocument): Promise<void> {
  await AsyncStorage.setItem(ACTIVE_DOCUMENT_KEY, JSON.stringify(document));
}

export async function clearLocalDocument(): Promise<void> {
  await AsyncStorage.removeItem(ACTIVE_DOCUMENT_KEY);
}

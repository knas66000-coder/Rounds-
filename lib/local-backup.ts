import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

import {
  BACKUP_FORMAT,
  BACKUP_KDF_ITERATIONS,
  BACKUP_SCHEMA_VERSION,
  filterStudyStorageRecords,
  localBackupFilename,
  type EncryptedLocalBackupEnvelope,
  type LocalStudyBackupPayload,
} from "@/shared/local-backup-crypto";

export {
  BACKUP_FORMAT,
  BACKUP_KDF_ITERATIONS,
  BACKUP_SCHEMA_VERSION,
  decryptLocalStudyBackup,
  isEncryptedLocalBackupEnvelope,
  isLocalStudyBackupPayload,
  isStudyBackupStorageKey,
  STUDY_BACKUP_STORAGE_KEYS,
  validateBackupPassphrase,
} from "@/shared/local-backup-crypto";
export type { EncryptedLocalBackupEnvelope, LocalStudyBackupPayload } from "@/shared/local-backup-crypto";

type LocalStoragePort = Pick<typeof AsyncStorage, "getAllKeys" | "multiGet">;

export async function collectLocalStudyData(storage: LocalStoragePort = AsyncStorage, now = new Date()): Promise<LocalStudyBackupPayload> {
  const eligibleKeys = (await storage.getAllKeys()).filter((key) => key.startsWith("rounds.")).sort();
  const records = eligibleKeys.length ? await storage.multiGet(eligibleKeys) : [];
  return { schemaVersion: BACKUP_SCHEMA_VERSION, exportedAt: now.toISOString(), storage: filterStudyStorageRecords(records) };
}

export async function encryptLocalStudyBackup(payload: LocalStudyBackupPayload, passphrase: string): Promise<EncryptedLocalBackupEnvelope> {
  const { encryptLocalStudyBackup: encrypt } = await import("@/shared/local-backup-crypto");
  return encrypt(payload, passphrase, { randomBytes: Crypto.getRandomBytesAsync });
}

export async function shareEncryptedLocalStudyBackup(envelope: EncryptedLocalBackupEnvelope): Promise<void> {
  const filename = localBackupFilename(new Date(envelope.createdAt));
  const content = JSON.stringify(envelope, null, 2);
  if (Platform.OS === "web") {
    const url = URL.createObjectURL(new Blob([content], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
    return;
  }
  if (!FileSystem.cacheDirectory) throw new Error("Your device could not prepare a backup file.");
  const uri = `${FileSystem.cacheDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(uri, content, { encoding: FileSystem.EncodingType.UTF8 });
  if (!(await Sharing.isAvailableAsync())) throw new Error("Sharing is not available on this device.");
  await Sharing.shareAsync(uri, { mimeType: "application/json", dialogTitle: "Save your encrypted Rounds backup" });
}

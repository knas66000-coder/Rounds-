import { gcm } from "@noble/ciphers/aes";
import { pbkdf2Async } from "@noble/hashes/pbkdf2";
import { sha256 } from "@noble/hashes/sha256";

export const BACKUP_SCHEMA_VERSION = 1 as const;
export const BACKUP_FORMAT = "rounds.encrypted-study-backup" as const;
export const BACKUP_KDF_ITERATIONS = 210_000;

const BACKUP_KEY_BYTES = 32;
const BACKUP_SALT_BYTES = 16;
const BACKUP_NONCE_BYTES = 12;

/** Only learner-controlled study state is eligible. Credentials and device-security settings are deliberately excluded. */
export const STUDY_BACKUP_STORAGE_KEYS = [
  "rounds.local-learning-profile.v1",
  "rounds.active-category.v1",
  "rounds.session.v1",
  "rounds.bookmarks.v1",
  "rounds.learning-signals.v1",
  "rounds.exam-remediation.v1",
  "rounds.voice.preferences.v1",
  "rounds.course-packs.installs.v1",
  "rounds.course-packs.resume.v1",
  "rounds.course-round.state.v1",
  "rounds.course-case-chains.v1",
  "rounds.university-topic-progress.v1",
  "rounds.high-school.level.v1",
  "rounds.high-school.revision.v1",
  "rounds.high-school.topic-scope.v1",
  "rounds.high-school.topic-progress.v1",
] as const;

const COURSE_DRAFT_PREFIX = "rounds.course-packs.draft.";

export type LocalStudyBackupPayload = {
  schemaVersion: typeof BACKUP_SCHEMA_VERSION;
  exportedAt: string;
  storage: Record<string, string>;
};

export type EncryptedLocalBackupEnvelope = {
  format: typeof BACKUP_FORMAT;
  schemaVersion: typeof BACKUP_SCHEMA_VERSION;
  createdAt: string;
  encryption: { algorithm: "AES-256-GCM"; nonceBase64: string };
  keyDerivation: { algorithm: "PBKDF2-HMAC-SHA-256"; iterations: number; saltBase64: string; keyBytes: number };
  ciphertextBase64: string;
};

export type BackupEncryptionOptions = { now?: Date; randomBytes: (length: number) => Promise<Uint8Array> };

export function isStudyBackupStorageKey(key: string): boolean {
  return (STUDY_BACKUP_STORAGE_KEYS as readonly string[]).includes(key) || key.startsWith(COURSE_DRAFT_PREFIX);
}

export function filterStudyStorageRecords(records: ReadonlyArray<readonly [string, string | null]>): Record<string, string> {
  return records.reduce<Record<string, string>>((result, [key, value]) => {
    if (value !== null && isStudyBackupStorageKey(key)) result[key] = value;
    return result;
  }, {});
}

export function validateBackupPassphrase(passphrase: string, confirmation?: string): string | null {
  if (passphrase.trim().length < 8) return "Use a passphrase with at least 8 characters.";
  if (confirmation !== undefined && passphrase !== confirmation) return "Your passphrases do not match.";
  return null;
}

export async function encryptLocalStudyBackup(payload: LocalStudyBackupPayload, passphrase: string, options: BackupEncryptionOptions): Promise<EncryptedLocalBackupEnvelope> {
  const problem = validateBackupPassphrase(passphrase);
  if (problem) throw new Error(problem);

  const [salt, nonce] = await Promise.all([options.randomBytes(BACKUP_SALT_BYTES), options.randomBytes(BACKUP_NONCE_BYTES)]);
  const derivedKey = await pbkdf2Async(sha256, passphrase, salt, { c: BACKUP_KDF_ITERATIONS, dkLen: BACKUP_KEY_BYTES, asyncTick: 12 });
  const plaintext = new TextEncoder().encode(JSON.stringify(payload));

  try {
    const ciphertext = gcm(derivedKey, nonce).encrypt(plaintext);
    return {
      format: BACKUP_FORMAT,
      schemaVersion: BACKUP_SCHEMA_VERSION,
      createdAt: (options.now ?? new Date()).toISOString(),
      encryption: { algorithm: "AES-256-GCM", nonceBase64: bytesToBase64(nonce) },
      keyDerivation: { algorithm: "PBKDF2-HMAC-SHA-256", iterations: BACKUP_KDF_ITERATIONS, saltBase64: bytesToBase64(salt), keyBytes: BACKUP_KEY_BYTES },
      ciphertextBase64: bytesToBase64(ciphertext),
    };
  } finally {
    derivedKey.fill(0);
    plaintext.fill(0);
  }
}

export async function decryptLocalStudyBackup(envelope: EncryptedLocalBackupEnvelope, passphrase: string): Promise<LocalStudyBackupPayload> {
  if (!isEncryptedLocalBackupEnvelope(envelope)) throw new Error("This is not a supported Rounds study backup.");
  const problem = validateBackupPassphrase(passphrase);
  if (problem) throw new Error(problem);

  const salt = base64ToBytes(envelope.keyDerivation.saltBase64);
  const nonce = base64ToBytes(envelope.encryption.nonceBase64);
  const ciphertext = base64ToBytes(envelope.ciphertextBase64);
  const derivedKey = await pbkdf2Async(sha256, passphrase, salt, { c: envelope.keyDerivation.iterations, dkLen: envelope.keyDerivation.keyBytes, asyncTick: 12 });

  try {
    const plaintext = gcm(derivedKey, nonce).decrypt(ciphertext);
    try {
      const parsed = JSON.parse(new TextDecoder().decode(plaintext)) as LocalStudyBackupPayload;
      if (!isLocalStudyBackupPayload(parsed)) throw new Error("The backup does not contain supported study data.");
      return parsed;
    } finally {
      plaintext.fill(0);
    }
  } catch {
    throw new Error("The passphrase is incorrect or this backup was changed.");
  } finally {
    derivedKey.fill(0);
  }
}

export function isEncryptedLocalBackupEnvelope(value: unknown): value is EncryptedLocalBackupEnvelope {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<EncryptedLocalBackupEnvelope>;
  return candidate.format === BACKUP_FORMAT
    && candidate.schemaVersion === BACKUP_SCHEMA_VERSION
    && typeof candidate.createdAt === "string"
    && candidate.encryption?.algorithm === "AES-256-GCM"
    && typeof candidate.encryption.nonceBase64 === "string"
    && candidate.keyDerivation?.algorithm === "PBKDF2-HMAC-SHA-256"
    && candidate.keyDerivation.iterations === BACKUP_KDF_ITERATIONS
    && candidate.keyDerivation.keyBytes === BACKUP_KEY_BYTES
    && typeof candidate.keyDerivation.saltBase64 === "string"
    && typeof candidate.ciphertextBase64 === "string";
}

export function isLocalStudyBackupPayload(value: unknown): value is LocalStudyBackupPayload {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<LocalStudyBackupPayload>;
  return candidate.schemaVersion === BACKUP_SCHEMA_VERSION
    && typeof candidate.exportedAt === "string"
    && Boolean(candidate.storage)
    && typeof candidate.storage === "object"
    && !Array.isArray(candidate.storage)
    && Object.entries(candidate.storage).every(([key, item]) => isStudyBackupStorageKey(key) && typeof item === "string");
}

export function localBackupFilename(now = new Date()): string {
  return `rounds-study-backup-${now.toISOString().slice(0, 10)}.rounds`;
}

function bytesToBase64(bytes: Uint8Array): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let output = "";
  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index] ?? 0;
    const second = bytes[index + 1];
    const third = bytes[index + 2];
    output += alphabet[first >> 2];
    output += alphabet[((first & 0x03) << 4) | ((second ?? 0) >> 4)];
    output += second === undefined ? "=" : alphabet[((second & 0x0f) << 2) | ((third ?? 0) >> 6)];
    output += third === undefined ? "=" : alphabet[third & 0x3f];
  }
  return output;
}

function base64ToBytes(value: string): Uint8Array {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const cleaned = value.replace(/\s/g, "");
  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(cleaned)) throw new Error("Invalid backup encoding.");
  const outputLength = (cleaned.length / 4) * 3 - (cleaned.endsWith("==") ? 2 : cleaned.endsWith("=") ? 1 : 0);
  const output = new Uint8Array(outputLength);
  let outputIndex = 0;
  for (let index = 0; index < cleaned.length; index += 4) {
    const a = alphabet.indexOf(cleaned[index]);
    const b = alphabet.indexOf(cleaned[index + 1]);
    const c = cleaned[index + 2] === "=" ? 0 : alphabet.indexOf(cleaned[index + 2]);
    const d = cleaned[index + 3] === "=" ? 0 : alphabet.indexOf(cleaned[index + 3]);
    const combined = (a << 18) | (b << 12) | (c << 6) | d;
    if (outputIndex < output.length) output[outputIndex++] = (combined >> 16) & 0xff;
    if (outputIndex < output.length) output[outputIndex++] = (combined >> 8) & 0xff;
    if (outputIndex < output.length) output[outputIndex++] = combined & 0xff;
  }
  return output;
}

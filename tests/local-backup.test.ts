import { describe, expect, it } from "vitest";

import {
  BACKUP_FORMAT,
  BACKUP_KDF_ITERATIONS,
  decryptLocalStudyBackup,
  encryptLocalStudyBackup,
  filterStudyStorageRecords,
  isEncryptedLocalBackupEnvelope,
  isStudyBackupStorageKey,
  validateBackupPassphrase,
} from "../shared/local-backup-crypto";

const fixedRandomBytes = async (length: number) => Uint8Array.from({ length }, (_, index) => (index + 17) % 256);
const fixedNow = new Date("2026-08-20T10:15:00.000Z");

describe("encrypted local study backup", () => {
  it("collects eligible private study keys and excludes device or account-security state", async () => {
    const records = filterStudyStorageRecords([
      ["rounds.session.v1", "stored:rounds.session.v1"],
      ["rounds.high-school.topic-progress.v1", "stored:rounds.high-school.topic-progress.v1"],
      ["rounds.course-packs.draft.education.foundation.v1", "stored:rounds.course-packs.draft.education.foundation.v1"],
      ["rounds.biometric-unlock.v1", "stored:rounds.biometric-unlock.v1"],
      ["rounds.native.session.v1", "stored:rounds.native.session.v1"],
      ["rounds.pdf.reader.account-1.material-1.content", "stored:rounds.pdf.reader.account-1.material-1.content"],
    ]);

    expect(records).toEqual({
      "rounds.course-packs.draft.education.foundation.v1": "stored:rounds.course-packs.draft.education.foundation.v1",
      "rounds.high-school.topic-progress.v1": "stored:rounds.high-school.topic-progress.v1",
      "rounds.session.v1": "stored:rounds.session.v1",
    });
    expect(isStudyBackupStorageKey("rounds.native.session.v1")).toBe(false);
    expect(isStudyBackupStorageKey("rounds.biometric-unlock.v1")).toBe(false);
  });

  it("rejects weak or unmatched backup passphrases", () => {
    expect(validateBackupPassphrase("short")).toBe("Use a passphrase with at least 8 characters.");
    expect(validateBackupPassphrase("long-enough", "different")).toBe("Your passphrases do not match.");
    expect(validateBackupPassphrase("long-enough", "long-enough")).toBeNull();
  });

  it("creates an authenticated encrypted envelope without plaintext study data", async () => {
    const payload = { schemaVersion: 1 as const, exportedAt: fixedNow.toISOString(), storage: { "rounds.bookmarks.v1": '[{"questionId":"nurse-001"}]' } };
    const envelope = await encryptLocalStudyBackup(payload, "private backup key", { now: fixedNow, randomBytes: fixedRandomBytes });
    const serialized = JSON.stringify(envelope);

    expect(envelope.format).toBe(BACKUP_FORMAT);
    expect(envelope.keyDerivation.iterations).toBe(BACKUP_KDF_ITERATIONS);
    expect(envelope.encryption.algorithm).toBe("AES-256-GCM");
    expect(isEncryptedLocalBackupEnvelope(envelope)).toBe(true);
    expect(serialized).not.toContain("nurse-001");
    expect(serialized).not.toContain("rounds.bookmarks.v1");
    await expect(decryptLocalStudyBackup(envelope, "wrong backup key")).rejects.toThrow("incorrect or this backup was changed");
    await expect(decryptLocalStudyBackup(envelope, "private backup key")).resolves.toEqual(payload);
  });
});

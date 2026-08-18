import { describe, expect, it } from "vitest";
import { accountExportContainsSensitiveFields, accountExportFilename, parseBiometricUnlock } from "../shared/account-privacy";

describe("Rounds account privacy utilities", () => {
  it("enables biometric protection only for an explicit saved preference", () => {
    expect(parseBiometricUnlock("true")).toBe(true);
    expect(parseBiometricUnlock("false")).toBe(false);
    expect(parseBiometricUnlock(null)).toBe(false);
  });

  it("creates a dated export name and rejects protected export fields", () => {
    expect(accountExportFilename(new Date("2026-08-18T12:00:00.000Z"))).toBe("rounds-account-export-2026-08-18.json");
    expect(accountExportContainsSensitiveFields({ account: { email: "learner@example.edu" }, material: { title: "Notes" } })).toBe(false);
    expect(accountExportContainsSensitiveFields({ passwordHash: "not-for-export" })).toBe(true);
    expect(accountExportContainsSensitiveFields({ nested: { storageKey: "private.pdf" } })).toBe(true);
  });
});

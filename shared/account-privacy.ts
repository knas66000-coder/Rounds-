export const BIOMETRIC_UNLOCK_KEY = "rounds.biometric-unlock.v1";

export function parseBiometricUnlock(value: string | null) {
  return value === "true";
}

export function accountExportFilename(now = new Date()) {
  return `rounds-account-export-${now.toISOString().slice(0, 10)}.json`;
}

export function accountExportContainsSensitiveFields(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some(accountExportContainsSensitiveFields);
  return Object.entries(value as Record<string, unknown>).some(([key, nested]) => /password|token|secret|storageKey/i.test(key) || accountExportContainsSensitiveFields(nested));
}

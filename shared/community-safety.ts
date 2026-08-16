export const communitySafetyNotice = "Share study support only. Do not share patient details, personal health information, exam recall, clinical advice, harassment, or contact information.";

const restrictedPatterns: Array<{ pattern: RegExp; message: string }> = [
  { pattern: /\b(mrn|medical record number|date of birth|dob|social security)\b/i, message: "Remove patient or identifying information before sharing." },
  { pattern: /\b(my patient|patient name|room\s*\d+|at my hospital)\b/i, message: "Do not share patient-specific or workplace details." },
  { pattern: /\b(on (the )?nclex|my nclex question|exam recall|recalled exam)\b/i, message: "Do not share recalled exam content." },
  { pattern: /\b(?:\+?\d[\d\s().-]{7,}\d)\b|[\w.+-]+@[\w-]+\.[\w.-]+/i, message: "Do not share contact information." },
  { pattern: /\b(kill yourself|hate you|stupid nurse)\b/i, message: "Keep the community respectful and supportive." },
];

export function validateCommunityText(value: string, maxLength: number): { valid: true; value: string } | { valid: false; message: string } {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (normalized.length < 2) return { valid: false, message: "Write at least 2 characters." };
  if (normalized.length > maxLength) return { valid: false, message: `Keep this message to ${maxLength} characters or fewer.` };
  const blocked = restrictedPatterns.find(({ pattern }) => pattern.test(normalized));
  return blocked ? { valid: false, message: blocked.message } : { valid: true, value: normalized };
}

import { normalizeRoundsEmail } from "./rounds-auth";

export const OWNER_CONTROL_PACKS = [
  { id: "nursing", title: "Nursing / Health Sciences", status: "active", detail: "Voice practice, Oral Exam, mock exams, adaptive review, and Research Updates." },
  { id: "foundation", title: "University Foundation Year", status: "planned", detail: "Academic Writing, Study Skills, Statistics, and Research Methods." },
  { id: "engineering", title: "Engineering Foundations", status: "planned", detail: "Mathematics, mechanics, technical drawing, and problem-solving." },
  { id: "high-school", title: "High School Combinations", status: "planned", detail: "Future BCM, PCM, Economics, Entrepreneurship, and related subject packs." },
] as const;

export function isRoundsOwnerEmail(email: string | null | undefined, configuredOwnerEmail: string | undefined) {
  if (!email || !configuredOwnerEmail) return false;
  return normalizeRoundsEmail(email) === normalizeRoundsEmail(configuredOwnerEmail);
}

export function canAccessOwnerControl(input: { email: string | null; role: "user" | "admin" }, configuredOwnerEmail: string | undefined) {
  return input.role === "admin" && isRoundsOwnerEmail(input.email, configuredOwnerEmail);
}

export function ownerPackStatusLabel(status: (typeof OWNER_CONTROL_PACKS)[number]["status"]) {
  return status === "active" ? "Active" : "Planned";
}

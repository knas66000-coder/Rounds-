import { normalizeRoundsEmail } from "./rounds-auth";

export const OWNER_CONTROL_PACKS = [
  { id: "nursing", title: "Nursing / Health Sciences", status: "active", detail: "Voice practice, Oral Exam, mock exams, adaptive review, and Research Updates." },
  { id: "foundation", title: "University Foundation Year", status: "active", detail: "Offline starter activities for Academic Writing and Digital Literacy, with staged shared units." },
  { id: "computing", title: "Computing Foundations", status: "active", detail: "Local starter activities for requirements, logic, and responsible digital decision-making." },
  { id: "business", title: "Business Foundations", status: "active", detail: "Local starter activities for customer evidence and responsible planning." },
  { id: "engineering", title: "Engineering Foundations", status: "active", detail: "Local starter activities for design constraints, structured reasoning, and technical communication." },
  { id: "natural-sciences", title: "Natural Sciences Foundations", status: "active", detail: "Local starter activities for observation, evidence, and explanation." },
  { id: "education", title: "Education Foundations", status: "active", detail: "Local starter activities for observable objectives and inclusive planning." },
  { id: "social-sciences", title: "Social Sciences Foundations", status: "active", detail: "Local starter activities for claims, evidence, and respectful interpretation." },
  { id: "uganda-high-school", title: "Uganda High School", status: "active", detail: "Active local starter packs for Biology, Chemistry, Economics, Entrepreneurship, English, Physics, and Mathematics, with private learning cases and offline installation." },
] as const;

export function isRoundsOwnerEmail(email: string | null | undefined, configuredOwnerEmail: string | undefined) {
  if (!email || !configuredOwnerEmail) return false;
  return normalizeRoundsEmail(email) === normalizeRoundsEmail(configuredOwnerEmail);
}

export function canAccessOwnerControl(input: { email: string | null; role: "user" | "admin" }, configuredOwnerEmail: string | undefined) {
  return input.role === "admin" && isRoundsOwnerEmail(input.email, configuredOwnerEmail);
}

export function ownerPackStatusLabel(status: "active" | "planned") {
  return status === "active" ? "Active" : "Planned";
}

import type { Category, Question } from "@/data/questionBank";

const CATEGORY_ALIASES: Record<Category, string[]> = {
  "Fundamentals": ["fundamentals", "foundations", "basic nursing"],
  "Pharmacology": ["pharmacology", "medications", "medication", "drugs"],
  "Cardiac": ["cardiac", "cardiology", "cardiovascular", "heart"],
  "Respiratory": ["respiratory", "respiratory care", "lungs"],
  "Endocrine": ["endocrine", "diabetes", "hormones"],
  "Renal": ["renal", "kidney", "urinary"],
  "Maternity": ["maternity", "maternal", "obstetric", "ob"],
  "Pediatrics": ["pediatrics", "pediatric", "children"],
  "Mental Health": ["mental health", "psychiatric", "psych"],
  "Infection Control": ["infection control", "infection", "sepsis", "precautions"],
  "Emergency": ["emergency", "urgent care", "triage"],
  "Critical Care": ["critical care", "intensive care", "icu"],
  "Prioritization": ["prioritization", "priorities", "delegation", "triage"],
  "Gastrointestinal": ["gastrointestinal", "gastro", "gi", "digestive"],
  "Neurological": ["neurological", "neurology", "neuro"],
};

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function matchOralExamTopic(transcript: string, categories: Category[]): Category | null {
  const normalized = normalize(transcript);
  if (!normalized) return null;
  return categories.find((category) => CATEGORY_ALIASES[category].some((alias) => normalized.includes(alias))) ?? null;
}

export function buildOralExamQueue(questionBank: Question[], category: Category, limit = 10): Question[] {
  return questionBank.filter((question) => question.cat === category).slice(0, limit);
}

export function selectOralExamFollowUp(
  current: Question,
  matchedKeys: string[],
  remainingQuestions: Question[],
): Question | null {
  const missing = current.keys.filter((key) => !matchedKeys.includes(key)).map(normalize);
  if (!missing.length) return null;

  return remainingQuestions
    .filter((question) => question.cat === current.cat && question.id !== current.id)
    .map((question) => ({
      question,
      overlap: question.keys.map(normalize).filter((key) => missing.includes(key)).length,
    }))
    .sort((a, b) => b.overlap - a.overlap || a.question.id.localeCompare(b.question.id))[0]?.question ?? null;
}

export function oralExamFollowUpPrompt(matchedKeys: string[], question: Question): string {
  const missing = question.keys.filter((key) => !matchedKeys.includes(key));
  if (!missing.length) return "You covered the key clinical points. Continue to the next question when ready.";
  return `Let us reinforce ${missing.slice(0, 2).join(" and ")}. Here is a focused follow-up from the same topic.`;
}

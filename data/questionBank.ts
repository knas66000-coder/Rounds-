import importedBank from "./question_bank_1000.json";

export type Category =
  | "Fundamentals"
  | "Pharmacology"
  | "Cardiac"
  | "Respiratory"
  | "Endocrine"
  | "Renal"
  | "Maternity"
  | "Pediatrics"
  | "Mental Health"
  | "Infection Control"
  | "Emergency"
  | "Critical Care"
  | "Prioritization"
  | "Gastrointestinal"
  | "Neurological";

export type Question = {
  id: string;
  cat: Category;
  q: string;
  a: string;
  keys: string[];
  context: string;
  explanation: string;
  clinicalSignificance: string;
  relatedConcepts: string[];
};

export const categories: { name: Category; topics: string }[] = [
  { name: "Fundamentals", topics: "Vital signs, safety, documentation, nursing process" },
  { name: "Pharmacology", topics: "Medication safety, antidotes, monitoring, adverse effects" },
  { name: "Cardiac", topics: "ECG, circulation, perfusion, hemodynamics" },
  { name: "Respiratory", topics: "Airway, oxygenation, ventilation, breath sounds" },
  { name: "Endocrine", topics: "Diabetes, glucose, thyroid, metabolic regulation" },
  { name: "Renal", topics: "Kidney function, fluid balance, electrolytes, dialysis" },
  { name: "Maternity", topics: "Pregnancy, labor, fetal monitoring, postpartum care" },
  { name: "Pediatrics", topics: "Growth, development, pediatric assessment, family care" },
  { name: "Mental Health", topics: "Therapeutic communication, mood, safety, psychosis" },
  { name: "Infection Control", topics: "Precautions, sepsis, hygiene, transmission prevention" },
  { name: "Emergency", topics: "Trauma, rapid response, resuscitation, urgent stabilization" },
  { name: "Critical Care", topics: "Ventilation, shock, ICU monitoring, complex instability" },
  { name: "Prioritization", topics: "ABCs, delegation, triage, clinical judgment" },
  { name: "Gastrointestinal", topics: "Abdominal assessment, liver, nutrition, elimination" },
  { name: "Neurological", topics: "Stroke, seizures, intracranial pressure, cognition" },
];

const validCategories = new Set(categories.map((category) => category.name));

export const questionBank: Question[] = importedBank.questions.map((question) => {
  if (!validCategories.has(question.cat as Category)) {
    throw new Error(`Unsupported category on imported question ${question.id}: ${question.cat}`);
  }
  return question as Question;
});

export const questionCountByCategory: Record<Category, number> = categories.reduce((counts, category) => {
  counts[category.name] = questionBank.filter((question) => question.cat === category.name).length;
  return counts;
}, {} as Record<Category, number>);

if (questionBank.length !== 1000) {
  throw new Error(`The imported Rounds question bank must contain 1,000 unique questions; found ${questionBank.length}.`);
}

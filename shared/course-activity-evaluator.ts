import type { CalculationActivity, LogicTraceActivity, ScenarioActivity } from "./course-pack-activities";

export function normalizeCalculationInput(value: string): number | null {
  const cleaned = value.trim().replace(/,/g, "").replace(/%/g, "");
  if (!cleaned || !/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(cleaned)) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

export function evaluateCalculationAnswer(value: string, activity: Pick<CalculationActivity, "expectedAnswer" | "tolerance" | "explanation">) {
  const parsed = normalizeCalculationInput(value);
  if (parsed === null) return { outcome: "review" as const, parsed: null, feedback: "Enter a numeric answer. You can include a percent sign when the question asks for one." };
  const tolerance = activity.tolerance ?? 0;
  const correct = Math.abs(parsed - activity.expectedAnswer) <= tolerance;
  return { outcome: correct ? "correct" as const : "review" as const, parsed, feedback: correct ? `Correct. ${activity.explanation}` : `Check the relationship and try the calculation again. ${activity.explanation}` };
}

export function evaluateLogicTraceAnswer(value: string, activity: Pick<LogicTraceActivity, "correctOption" | "explanation">) {
  const correct = value === activity.correctOption;
  return { outcome: correct ? "correct" as const : "review" as const, feedback: correct ? `Correct. ${activity.explanation}` : `Review the order of the stated rules. ${activity.explanation}` };
}

export function evaluateScenarioDecision(value: string, activity: Pick<ScenarioActivity, "bestOption" | "explanation">) {
  const correct = value === activity.bestOption;
  return { outcome: correct ? "correct" as const : "review" as const, feedback: correct ? `Responsible decision. ${activity.explanation}` : `Review the stated context and choose the option that best protects the learning objective. ${activity.explanation}` };
}

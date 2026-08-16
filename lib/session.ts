import { questionBank, type Category, type Question } from "../data/questionBank";
import type { Verdict } from "./rounds";

export const ACTIVE_CATEGORY_KEY = "rounds.active-category.v1";

export function questionsForCategory(category: Category | "All"): Question[] {
  return category === "All" ? questionBank : questionBank.filter((item) => item.cat === category);
}

export function nextStepForVerdict(verdict: Verdict): string {
  if (verdict === "correct") return "Strong work. Continue while the clinical reasoning is fresh.";
  if (verdict === "partial") return "Review the unrecognized key terms, then try to include them in your next response.";
  return "Pause on the key answer, then say the full clinical reasoning aloud before moving on.";
}

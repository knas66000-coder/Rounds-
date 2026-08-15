import type { Question } from "@/data/questionBank";

export type Verdict = "correct" | "partial" | "incorrect";

export type Evaluation = {
  verdict: Verdict;
  matched: string[];
  score: number;
  feedback: string;
};

export function evaluateAnswer(transcript: string, item: Question): Evaluation {
  const normalized = transcript.toLowerCase();
  const matched = item.keys.filter((keyword) => normalized.includes(keyword.toLowerCase()));
  const score = item.keys.length ? matched.length / item.keys.length : 0;
  const verdict: Verdict = score >= 0.6 ? "correct" : score > 0 ? "partial" : "incorrect";
  const feedback = verdict === "correct"
    ? "Correct. Your answer included the key clinical points."
    : verdict === "partial"
      ? "Partially correct. Review the missing clinical points below."
      : "Not quite. Compare your response with the key answer and clinical context.";
  return { verdict, matched, score, feedback };
}

export function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

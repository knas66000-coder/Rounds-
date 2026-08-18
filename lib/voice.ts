export const VOICE_PREFERENCES_KEY = "rounds.voice.preferences.v1";

export type VoicePreferences = { rate: number; spokenRationale: boolean };

export const defaultVoicePreferences: VoicePreferences = { rate: 0.92, spokenRationale: true };

export function clampSpeechRate(rate: number): number {
  return Math.min(1.15, Math.max(0.72, Math.round(rate * 100) / 100));
}

export function parseVoicePreferences(value: string | null): VoicePreferences {
  if (!value) return defaultVoicePreferences;
  try {
    const parsed = JSON.parse(value) as Partial<VoicePreferences>;
    return {
      rate: typeof parsed.rate === "number" ? clampSpeechRate(parsed.rate) : defaultVoicePreferences.rate,
      spokenRationale: typeof parsed.spokenRationale === "boolean" ? parsed.spokenRationale : defaultVoicePreferences.spokenRationale,
    };
  } catch {
    return defaultVoicePreferences;
  }
}

export function prepareQuestionSpeech(question: string): string {
  const normalized = question
    .replace(/≤/g, " less than or equal to ")
    .replace(/≥/g, " greater than or equal to ")
    .replace(/°/g, " degrees ")
    .replace(/\s+/g, " ")
    .trim();
  return `Question. ${normalized} Pause to think. Then state your answer when recording begins.`;
}

export function prepareFeedbackSpeech(feedback: string): string {
  return `Feedback. ${feedback.trim()}`;
}

export function prepareRationaleSpeech(clinicalContext: string, whyItMatters: string): string {
  return `Clinical rationale. ${clinicalContext.trim()} Why it matters. ${whyItMatters.trim()}`;
}

/** Prepares a short, private learner PDF section for the device text-to-speech engine. */
export function preparePdfSectionSpeech(heading: string, content: string): string {
  const normalizedHeading = heading.replace(/\s+/g, " ").trim();
  const normalizedContent = content
    .replace(/≤/g, " less than or equal to ")
    .replace(/≥/g, " greater than or equal to ")
    .replace(/°/g, " degrees ")
    .replace(/\s+/g, " ")
    .trim();
  return `Study passage. ${normalizedHeading}. ${normalizedContent}`;
}

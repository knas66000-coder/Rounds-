export const VOICE_PREFERENCES_KEY = "rounds.voice.preferences.v1";

export type VoicePreferences = { rate: number; spokenRationale: boolean; voiceIdentifier: string | null };
export type InstalledVoice = { identifier: string; name: string; language: string; quality: "Default" | "Enhanced" };

export const defaultVoicePreferences: VoicePreferences = { rate: 0.92, spokenRationale: true, voiceIdentifier: null };

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
      voiceIdentifier: typeof parsed.voiceIdentifier === "string" && parsed.voiceIdentifier.trim() ? parsed.voiceIdentifier : null,
    };
  } catch {
    return defaultVoicePreferences;
  }
}

const englishLanguagePriority = ["en-us", "en-gb", "en-au", "en-ca"];

function languageScore(language: string): number {
  const normalized = language.toLowerCase().replace(/_/g, "-");
  const index = englishLanguagePriority.indexOf(normalized);
  return index >= 0 ? index : 10;
}

/** Lists only installed English voices, beginning with the clearest available starting candidates. */
export function rankInstalledEnglishVoices(voices: InstalledVoice[]): InstalledVoice[] {
  return voices
    .filter((voice) => /^en([_-]|$)/i.test(voice.language))
    .sort((left, right) => {
      const languageDifference = languageScore(left.language) - languageScore(right.language);
      if (languageDifference) return languageDifference;
      const qualityDifference = Number(right.quality === "Enhanced") - Number(left.quality === "Enhanced");
      if (qualityDifference) return qualityDifference;
      return left.name.localeCompare(right.name);
    });
}

/** Finds the learner's chosen local voice, or a reliable English starting candidate if it is unavailable. */
export function resolveRoundsVoice(voices: InstalledVoice[], preferredIdentifier: string | null): InstalledVoice | null {
  const ranked = rankInstalledEnglishVoices(voices);
  return ranked.find((voice) => voice.identifier === preferredIdentifier) ?? ranked[0] ?? null;
}

/** Formats common Nursing notation only for local speech, preserving the text the learner sees. */
export function prepareLocalSpeech(text: string): string {
  return text
    .replace(/SpO₂|SpO2/gi, " S P O two ")
    .replace(/≤/g, " less than or equal to ")
    .replace(/≥/g, " greater than or equal to ")
    .replace(/°/g, " degrees ")
    .replace(/\bN\s*CLEX\b/gi, " N CLEX ")
    .replace(/\bBP\b/g, " blood pressure ")
    .replace(/\bHR\b/g, " heart rate ")
    .replace(/\bRR\b/g, " respiratory rate ")
    .replace(/\bO2\b/gi, " oxygen ")
    .replace(/\bIV\b/g, " intravenous ")
    .replace(/\bIM\b/g, " intramuscular ")
    .replace(/\bPO\b/g, " by mouth ")
    .replace(/\bmL\b/g, " milliliters ")
    .replace(/\bmg\b/g, " milligrams ")
    .replace(/\bmcg\b/gi, " micrograms ")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();
}

export function prepareQuestionSpeech(question: string): string {
  return `Question. ${prepareLocalSpeech(question)} Pause to think. Then state your answer when recording begins.`;
}

export function prepareFeedbackSpeech(feedback: string): string {
  return `Feedback. ${prepareLocalSpeech(feedback)}`;
}

export function prepareRationaleSpeech(clinicalContext: string, whyItMatters: string): string {
  return `Clinical rationale. ${prepareLocalSpeech(clinicalContext)} Why it matters. ${prepareLocalSpeech(whyItMatters)}`;
}

/** Prepares a short, private learner PDF section for the selected local text-to-speech engine. */
export function preparePdfSectionSpeech(heading: string, content: string): string {
  return `Study passage. ${prepareLocalSpeech(heading)}. ${prepareLocalSpeech(content)}`;
}

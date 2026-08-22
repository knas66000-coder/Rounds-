export const PRIVATE_CLONE_DEFAULT_PROFILE = "owner-primary";
export const PRIVATE_CLONE_DEFAULT_PRONUNCIATION_PROFILE = "ug-en-document-reader";

export type PrivateCloneVoiceConfiguration = {
  serviceUrl: string;
  voiceProfileId: string;
};

export function parsePrivateCloneVoiceConfiguration(value: string | null): PrivateCloneVoiceConfiguration {
  if (!value) return { serviceUrl: "", voiceProfileId: PRIVATE_CLONE_DEFAULT_PROFILE };
  try {
    const parsed = JSON.parse(value) as Partial<PrivateCloneVoiceConfiguration>;
    return {
      serviceUrl: typeof parsed.serviceUrl === "string" ? parsed.serviceUrl.trim().replace(/\/+$/, "") : "",
      voiceProfileId: typeof parsed.voiceProfileId === "string" && /^[a-z0-9-]{1,80}$/i.test(parsed.voiceProfileId.trim()) ? parsed.voiceProfileId.trim() : PRIVATE_CLONE_DEFAULT_PROFILE,
    };
  } catch {
    return { serviceUrl: "", voiceProfileId: PRIVATE_CLONE_DEFAULT_PROFILE };
  }
}

export function validatePrivateCloneVoiceConfiguration(configuration: PrivateCloneVoiceConfiguration): PrivateCloneVoiceConfiguration {
  const serviceUrl = configuration.serviceUrl.trim().replace(/\/+$/, "");
  const voiceProfileId = configuration.voiceProfileId.trim();
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(serviceUrl);
  } catch {
    throw new Error("Enter the secure HTTPS address for your private voice service.");
  }
  if (parsedUrl.protocol !== "https:") throw new Error("Your private voice service must use HTTPS.");
  if (!/^[a-z0-9-]{1,80}$/i.test(voiceProfileId)) throw new Error("Voice profile names may use letters, numbers, and hyphens only.");
  return { serviceUrl, voiceProfileId };
}

export function privateCloneSpeechUrl(serviceUrl: string): string {
  return `${serviceUrl.replace(/\/+$/, "")}/v1/speech`;
}

/** Returns a best-effort WAV duration for lifecycle cleanup. It never inspects audio content beyond the WAV header. */
export function wavDurationMilliseconds(bytes: Uint8Array): number | null {
  if (bytes.length < 44 || String.fromCharCode(...bytes.slice(0, 4)) !== "RIFF" || String.fromCharCode(...bytes.slice(8, 12)) !== "WAVE") return null;
  let offset = 12;
  let byteRate: number | null = null;
  let dataSize: number | null = null;
  const textAt = (index: number) => String.fromCharCode(...bytes.slice(index, index + 4));
  const uint32At = (index: number) => bytes[index] | (bytes[index + 1] << 8) | (bytes[index + 2] << 16) | (bytes[index + 3] << 24);

  while (offset + 8 <= bytes.length) {
    const chunkId = textAt(offset);
    const chunkSize = uint32At(offset + 4) >>> 0;
    if (chunkId === "fmt " && chunkSize >= 16 && offset + 20 <= bytes.length) byteRate = uint32At(offset + 16) >>> 0;
    if (chunkId === "data") { dataSize = chunkSize; break; }
    offset += 8 + chunkSize + (chunkSize % 2);
  }
  return byteRate && dataSize !== null && byteRate > 0 ? Math.ceil((dataSize / byteRate) * 1000) : null;
}

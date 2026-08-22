import { describe, expect, it } from "vitest";

import { parsePrivateCloneVoiceConfiguration, privateCloneSpeechUrl, validatePrivateCloneVoiceConfiguration, wavDurationMilliseconds } from "../lib/private-cloned-voice-core";

describe("private cloned voice configuration", () => {
  it("keeps the approved profile default when stored settings are absent or malformed", () => {
    expect(parsePrivateCloneVoiceConfiguration(null)).toEqual({ serviceUrl: "", voiceProfileId: "owner-primary" });
    expect(parsePrivateCloneVoiceConfiguration("not-json")).toEqual({ serviceUrl: "", voiceProfileId: "owner-primary" });
  });

  it("requires an HTTPS service and returns the canonical speech route", () => {
    expect(validatePrivateCloneVoiceConfiguration({ serviceUrl: "https://voice.example.test/", voiceProfileId: "owner-primary" })).toEqual({ serviceUrl: "https://voice.example.test", voiceProfileId: "owner-primary" });
    expect(privateCloneSpeechUrl("https://voice.example.test/")).toBe("https://voice.example.test/v1/speech");
    expect(() => validatePrivateCloneVoiceConfiguration({ serviceUrl: "http://voice.example.test", voiceProfileId: "owner-primary" })).toThrow("HTTPS");
  });
});

describe("private cloned voice WAV lifecycle", () => {
  it("reads a standard WAV duration from header bytes without decoding audio content", () => {
    const wav = new Uint8Array(44);
    wav.set([82, 73, 70, 70], 0); // RIFF
    wav.set([87, 65, 86, 69], 8); // WAVE
    wav.set([102, 109, 116, 32], 12); // fmt
    wav.set([16, 0, 0, 0], 16);
    wav.set([1, 0, 1, 0], 20);
    wav.set([128, 187, 0, 0], 24); // 48000 Hz
    wav.set([128, 187, 0, 0], 28); // 48000 bytes/s mono 8-bit
    wav.set([1, 0, 8, 0], 32);
    wav.set([100, 97, 116, 97], 36); // data
    wav.set([128, 187, 0, 0], 40); // 48000 bytes
    expect(wavDurationMilliseconds(wav)).toBe(1000);
  });
});

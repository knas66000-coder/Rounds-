import { useCallback, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Speech from "expo-speech";

import { defaultVoicePreferences, parseVoicePreferences, rankInstalledEnglishVoices, resolveRoundsVoice, VOICE_PREFERENCES_KEY, type InstalledVoice, type VoicePreferences } from "@/lib/voice";

function toInstalledVoice(voice: Speech.Voice): InstalledVoice {
  return { identifier: voice.identifier, name: voice.name, language: voice.language, quality: voice.quality === "Enhanced" ? "Enhanced" : "Default" };
}

/** Loads one deliberate installed English voice for every Rounds spoken-learning surface. */
export function useRoundsVoice() {
  const [preferences, setPreferences] = useState<VoicePreferences>(defaultVoicePreferences);
  const [voices, setVoices] = useState<InstalledVoice[]>([]);

  const reload = useCallback(async () => {
    const [stored, available] = await Promise.all([
      AsyncStorage.getItem(VOICE_PREFERENCES_KEY),
      Speech.getAvailableVoicesAsync(),
    ]);
    setPreferences(parseVoicePreferences(stored));
    setVoices(available.map(toInstalledVoice));
  }, []);

  useEffect(() => { void reload().catch(() => { setVoices([]); }); }, [reload]);

  const englishVoices = useMemo(() => rankInstalledEnglishVoices(voices), [voices]);
  const selectedVoice = useMemo(() => resolveRoundsVoice(voices, preferences.voiceIdentifier), [voices, preferences.voiceIdentifier]);
  const speechOptions = useMemo(() => selectedVoice ? { voice: selectedVoice.identifier, language: selectedVoice.language, rate: preferences.rate } : null, [selectedVoice, preferences.rate]);

  return { preferences, englishVoices, selectedVoice, speechOptions, reload };
}

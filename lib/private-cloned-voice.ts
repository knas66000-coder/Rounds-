import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";

import {
  PRIVATE_CLONE_DEFAULT_PRONUNCIATION_PROFILE,
  parsePrivateCloneVoiceConfiguration,
  privateCloneSpeechUrl,
  type PrivateCloneVoiceConfiguration,
  validatePrivateCloneVoiceConfiguration,
  wavDurationMilliseconds,
} from "@/lib/private-cloned-voice-core";

const PRIVATE_CLONE_CONFIGURATION_KEY = "rounds.private-cloned-voice.configuration.v1";
const PRIVATE_CLONE_TOKEN_KEY = "rounds.private-cloned-voice.token.v1";

export type PrivateCloneVoiceConnection = PrivateCloneVoiceConfiguration & { token: string };
export type PrivateCloneSpeechOptions = { onDone?: () => void; pronunciationProfile?: string };

function bytesToBase64(bytes: Uint8Array): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let output = "";
  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index];
    const second = bytes[index + 1];
    const third = bytes[index + 2];
    output += alphabet[first >> 2];
    output += alphabet[((first & 3) << 4) | ((second ?? 0) >> 4)];
    output += second === undefined ? "=" : alphabet[((second & 15) << 2) | ((third ?? 0) >> 6)];
    output += third === undefined ? "=" : alphabet[third & 63];
  }
  return output;
}

async function loadPrivateCloneVoiceConnection(): Promise<PrivateCloneVoiceConnection> {
  const storedConfiguration = await AsyncStorage.getItem(PRIVATE_CLONE_CONFIGURATION_KEY);
  const configuration = parsePrivateCloneVoiceConfiguration(storedConfiguration);
  if (Platform.OS === "web") return { ...configuration, token: "" };
  const token = (await SecureStore.getItemAsync(PRIVATE_CLONE_TOKEN_KEY))?.trim() ?? "";
  return { ...configuration, token };
}

async function persistPrivateCloneVoiceConnection(connection: PrivateCloneVoiceConnection): Promise<PrivateCloneVoiceConfiguration> {
  if (Platform.OS === "web") throw new Error("Private cloned voice setup is available in the installed Rounds app only.");
  const configuration = validatePrivateCloneVoiceConfiguration(connection);
  if (!connection.token.trim()) throw new Error("Enter the private voice-service access token.");
  await Promise.all([
    AsyncStorage.setItem(PRIVATE_CLONE_CONFIGURATION_KEY, JSON.stringify(configuration)),
    SecureStore.setItemAsync(PRIVATE_CLONE_TOKEN_KEY, connection.token.trim()),
  ]);
  return configuration;
}

async function clearPrivateCloneVoiceConnection(): Promise<void> {
  await Promise.all([
    AsyncStorage.removeItem(PRIVATE_CLONE_CONFIGURATION_KEY),
    Platform.OS === "web" ? Promise.resolve() : SecureStore.deleteItemAsync(PRIVATE_CLONE_TOKEN_KEY),
  ]);
}

export function usePrivateClonedVoice() {
  const [connection, setConnection] = useState<PrivateCloneVoiceConnection>({ serviceUrl: "", voiceProfileId: "owner-primary", token: "" });
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<AudioPlayer | null>(null);
  const cacheUriRef = useRef<string | null>(null);
  const completionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const releasePlayback = useCallback(async (notifyCompletion = false) => {
    if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
    completionTimerRef.current = null;
    try { playerRef.current?.remove(); } catch { /* A released player requires no further action. */ }
    playerRef.current = null;
    if (cacheUriRef.current) {
      try { await FileSystem.deleteAsync(cacheUriRef.current, { idempotent: true }); } catch { /* Cache cleanup must not interrupt the reader. */ }
      cacheUriRef.current = null;
    }
    setIsPlaying(false);
    if (notifyCompletion) completionCallbackRef.current?.();
    completionCallbackRef.current = null;
  }, []);

  const completionCallbackRef = useRef<(() => void) | null>(null);

  const reload = useCallback(async () => {
    const next = await loadPrivateCloneVoiceConnection();
    setConnection(next);
    return next;
  }, []);

  useEffect(() => { void reload(); }, [reload]);
  useEffect(() => () => { void releasePlayback(false); }, [releasePlayback]);

  const saveConnection = useCallback(async (next: PrivateCloneVoiceConnection) => {
    const configuration = await persistPrivateCloneVoiceConnection(next);
    setConnection({ ...configuration, token: next.token.trim() });
  }, []);

  const clearConnection = useCallback(async () => {
    await releasePlayback(false);
    await clearPrivateCloneVoiceConnection();
    setConnection({ serviceUrl: "", voiceProfileId: "owner-primary", token: "" });
  }, [releasePlayback]);

  const speak = useCallback(async (text: string, options: PrivateCloneSpeechOptions = {}) => {
    const preparedText = text.trim();
    if (!preparedText) throw new Error("There is no text to read aloud.");
    if (Platform.OS === "web") throw new Error("Private cloned speech is available in the installed Rounds app only.");
    const activeConnection = await loadPrivateCloneVoiceConnection();
    const configuration = validatePrivateCloneVoiceConfiguration(activeConnection);
    if (!activeConnection.token) throw new Error("Connect your private cloned-voice service in Settings before listening.");

    await releasePlayback(false);
    const response = await fetch(privateCloneSpeechUrl(configuration.serviceUrl), {
      method: "POST",
      headers: { Authorization: `Bearer ${activeConnection.token}`, "Content-Type": "application/json", Accept: "audio/wav" },
      body: JSON.stringify({ text: preparedText, voiceProfileId: configuration.voiceProfileId, pronunciationProfile: options.pronunciationProfile ?? PRIVATE_CLONE_DEFAULT_PRONUNCIATION_PROFILE, quality: "clarity" }),
    });
    if (!response.ok) throw new Error(response.status === 401 ? "The private voice-service access token was rejected." : "Private cloned speech is unavailable right now.");
    if (!response.headers.get("content-type")?.toLowerCase().includes("audio/wav")) throw new Error("Private voice service returned an unsupported audio format.");

    const bytes = new Uint8Array(await response.arrayBuffer());
    if (!bytes.length) throw new Error("Private voice service returned empty audio.");
    if (!FileSystem.cacheDirectory) throw new Error("This device could not prepare temporary cloned audio.");
    const cacheUri = `${FileSystem.cacheDirectory}rounds-private-clone-${Date.now()}.wav`;
    await FileSystem.writeAsStringAsync(cacheUri, bytesToBase64(bytes), { encoding: FileSystem.EncodingType.Base64 });
    cacheUriRef.current = cacheUri;
    completionCallbackRef.current = options.onDone ?? null;
    await setAudioModeAsync({ playsInSilentMode: true });
    const player = createAudioPlayer(cacheUri);
    playerRef.current = player;
    setIsPlaying(true);
    player.play();
    const duration = wavDurationMilliseconds(bytes) ?? 5_000;
    completionTimerRef.current = setTimeout(() => { void releasePlayback(true); }, Math.max(900, duration + 350));
  }, [releasePlayback]);

  return {
    connection,
    isConfigured: Boolean(connection.serviceUrl && connection.token),
    isPlaying,
    reload,
    saveConnection,
    clearConnection,
    speak,
    stop: () => releasePlayback(false),
  };
}

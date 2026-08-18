import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const ROUNDS_SESSION_KEY = "rounds.native.session.v1";

export async function getRoundsSessionToken() {
  try {
    if (Platform.OS === "web") return window.localStorage.getItem(ROUNDS_SESSION_KEY);
    return await SecureStore.getItemAsync(ROUNDS_SESSION_KEY);
  } catch {
    return null;
  }
}

export async function setRoundsSessionToken(token: string) {
  if (Platform.OS === "web") {
    window.localStorage.setItem(ROUNDS_SESSION_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(ROUNDS_SESSION_KEY, token);
}

export async function clearRoundsSessionToken() {
  try {
    if (Platform.OS === "web") {
      window.localStorage.removeItem(ROUNDS_SESSION_KEY);
      return;
    }
    await SecureStore.deleteItemAsync(ROUNDS_SESSION_KEY);
  } catch {
    // Session removal is best-effort; the local identity state is always cleared.
  }
}

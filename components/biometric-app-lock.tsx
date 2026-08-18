import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, AppState, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useAuthSession } from "@/lib/auth-session";
import { useColors } from "@/hooks/use-colors";
import { BIOMETRIC_UNLOCK_KEY, parseBiometricUnlock } from "@/shared/account-privacy";

const LOCK_AFTER_BACKGROUND_MS = 60_000;

export function BiometricAppLock({ children }: { children: React.ReactNode }) {
  const colors = useColors();
  const { isAuthenticated, logout } = useAuthSession();
  const backgroundAt = useRef<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [message, setMessage] = useState("Unlock Rounds to continue your private study session.");
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || Platform.OS === "web") { setLocked(false); return; }
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "background" || state === "inactive") backgroundAt.current = Date.now();
      if (state === "active" && backgroundAt.current) {
        const elapsed = Date.now() - backgroundAt.current;
        backgroundAt.current = null;
        void AsyncStorage.getItem(BIOMETRIC_UNLOCK_KEY).then((value) => {
          if (parseBiometricUnlock(value) && elapsed >= LOCK_AFTER_BACKGROUND_MS) setLocked(true);
        });
      }
    });
    return () => subscription.remove();
  }, [isAuthenticated]);

  const unlock = async () => {
    setChecking(true);
    setMessage("Confirm your device identity to unlock Rounds.");
    try {
      const [hasHardware, enrolled] = await Promise.all([LocalAuthentication.hasHardwareAsync(), LocalAuthentication.isEnrolledAsync()]);
      if (!hasHardware || !enrolled) {
        setMessage("Biometric unlock is no longer available on this device. Sign out, then sign in with your Rounds password.");
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({ promptMessage: "Unlock Rounds", cancelLabel: "Keep locked" });
      if (result.success) { setLocked(false); setMessage("Unlock Rounds to continue your private study session."); }
      else if (result.error !== "user_cancel") setMessage("Rounds remains locked. Try again or sign out to use your password.");
    } finally {
      setChecking(false);
    }
  };

  if (!locked) return <>{children}</>;
  return <View style={[styles.screen, { backgroundColor: colors.background }]}><View style={styles.card}><Text style={[styles.eyebrow, { color: colors.primary }]}>ROUNDS LOCKED</Text><Text style={[styles.title, { color: colors.foreground }]}>Your study space is private.</Text><Text style={[styles.body, { color: colors.muted }]}>{message}</Text><Pressable onPress={() => void unlock()} disabled={checking} accessibilityRole="button" style={({ pressed }) => [styles.primary, { backgroundColor: colors.primary }, (pressed || checking) && styles.pressed]}>{checking ? <ActivityIndicator color={colors.background} /> : <Text style={[styles.primaryText, { color: colors.background }]}>Unlock with biometrics</Text>}</Pressable><Pressable onPress={() => void logout()} accessibilityRole="button"><Text style={[styles.signOut, { color: colors.primary }]}>Sign out and use password</Text></Pressable></View></View>;
}

const styles = StyleSheet.create({ screen: { flex: 1, justifyContent: "center", padding: 24 }, card: { gap: 16, maxWidth: 520, width: "100%", alignSelf: "center" }, eyebrow: { fontSize: 12, fontWeight: "900", letterSpacing: 2.2 }, title: { fontFamily: "Georgia", fontSize: 32, lineHeight: 40, fontWeight: "700" }, body: { fontSize: 16, lineHeight: 24 }, primary: { minHeight: 58, borderRadius: 17, justifyContent: "center", alignItems: "center", marginTop: 4 }, primaryText: { fontSize: 16, fontWeight: "900" }, signOut: { textAlign: "center", fontSize: 14, fontWeight: "800", paddingVertical: 8 }, pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] } });

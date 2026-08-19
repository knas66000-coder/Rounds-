import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuthSession } from "@/lib/auth-session";
import { useColors } from "@/hooks/use-colors";

export function SecureAccessGate({ busy = false }: { busy?: boolean }) {
  const colors = useColors();
  const { error, signIn, register } = useAuthSession();
  const [mode, setMode] = useState<"sign-in" | "register">("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const submit = async () => {
    try {
      setFormError(null);
      if (mode === "register") await register({ name, email, password });
      else await signIn({ email, password });
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : "We could not secure your Rounds account. Try again.");
    }
  };

  if (busy) {
    return (
      <SafeAreaView edges={["top", "bottom", "left", "right"]} style={[styles.busyScreen, { backgroundColor: colors.background }]}>
        <View style={[styles.busyMark, { backgroundColor: colors.primary }]}><Text style={[styles.busyMarkText, { color: colors.background }]}>R</Text></View>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.loading, { color: colors.muted }]}>Preparing your private study space…</Text>
      </SafeAreaView>
    );
  }

  const isRegister = mode === "register";
  return (
    <SafeAreaView edges={["top", "bottom", "left", "right"]} style={[styles.screen, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.select({ ios: "padding", default: undefined })} style={styles.keyboardArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.brandBlock}>
            <View style={[styles.brandMark, { backgroundColor: colors.primary }]}><Text style={[styles.brandMarkText, { color: colors.background }]}>R</Text></View>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>ROUNDS</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>{isRegister ? "Start your study space." : "Your study space."}</Text>
            <Text style={[styles.body, { color: colors.muted }]}>{isRegister ? "Create a private Rounds account to keep your learning path with you." : "Sign in to continue your voice-first learning session."}</Text>
          </View>

          <View style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.sheetHeading}>
              <Text style={[styles.sheetTitle, { color: colors.foreground }]}>{isRegister ? "Create account" : "Sign in"}</Text>
              <Text style={[styles.sheetBody, { color: colors.muted }]}>{isRegister ? "Your profile and private study material stay connected to this account." : "Your progress, saved study content, and settings are ready when you are."}</Text>
            </View>
            {isRegister ? <TextInput value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={colors.muted} autoCapitalize="words" returnKeyType="next" style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]} accessibilityLabel="Your name" /> : null}
            <TextInput value={email} onChangeText={setEmail} placeholder="Email address" placeholderTextColor={colors.muted} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" returnKeyType="next" style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]} accessibilityLabel="Email address" />
            <TextInput value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor={colors.muted} secureTextEntry autoCapitalize="none" autoCorrect={false} returnKeyType="done" onSubmitEditing={() => void submit()} style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]} accessibilityLabel="Password" />
            <Pressable onPress={() => void submit()} accessibilityRole="button" accessibilityLabel={isRegister ? "Create a Rounds account" : "Sign in to Rounds"} style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.primary }, pressed && styles.pressed]}>
              <Text style={[styles.primaryText, { color: colors.background }]}>{isRegister ? "Create account" : "Continue"}</Text>
            </Pressable>
            <Pressable onPress={() => { setMode(isRegister ? "sign-in" : "register"); setFormError(null); }} accessibilityRole="button" style={({ pressed }) => [styles.modeButton, pressed && styles.pressed]}>
              <Text style={[styles.modeText, { color: colors.primary }]}>{isRegister ? "I already have an account" : "Create a Rounds account"}</Text>
            </Pressable>
            {formError || error ? <Text style={[styles.error, { color: colors.error }]}>{formError ?? "We could not confirm your Rounds session. Please sign in again."}</Text> : null}
          </View>
          <Text style={[styles.footnote, { color: colors.muted }]}>Private by design. Rounds is a study tool and does not provide medical care or official exam scoring.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  keyboardArea: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 28, paddingBottom: 20, gap: 24 },
  brandBlock: { gap: 7, paddingTop: 8 },
  brandMark: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 9 },
  brandMarkText: { fontSize: 23, fontWeight: "900" },
  eyebrow: { fontSize: 11, letterSpacing: 2.1, fontWeight: "900" },
  title: { fontFamily: "Georgia", fontSize: 32, lineHeight: 39, fontWeight: "700" },
  body: { fontSize: 15, lineHeight: 22, maxWidth: 350 },
  sheet: { borderWidth: 1, borderRadius: 28, padding: 18, gap: 11 },
  sheetHeading: { gap: 4, marginBottom: 4 },
  sheetTitle: { fontSize: 19, fontWeight: "900" },
  sheetBody: { fontSize: 13, lineHeight: 19 },
  input: { minHeight: 54, borderWidth: 1, borderRadius: 16, paddingHorizontal: 15, fontSize: 16 },
  primaryButton: { minHeight: 56, borderRadius: 17, justifyContent: "center", alignItems: "center", marginTop: 4 },
  primaryText: { fontSize: 16, fontWeight: "900" },
  modeButton: { minHeight: 40, justifyContent: "center", alignItems: "center" },
  modeText: { fontSize: 14, fontWeight: "800" },
  error: { fontSize: 13, lineHeight: 19, textAlign: "center", paddingHorizontal: 5 },
  footnote: { fontSize: 11, lineHeight: 16, textAlign: "center", paddingHorizontal: 10 },
  busyScreen: { flex: 1, alignItems: "center", justifyContent: "center", gap: 13, padding: 24 },
  busyMark: { width: 46, height: 46, borderRadius: 15, alignItems: "center", justifyContent: "center", marginBottom: 3 },
  busyMarkText: { fontSize: 24, fontWeight: "900" },
  loading: { fontSize: 14, fontWeight: "700", textAlign: "center" },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
});

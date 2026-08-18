import { useState } from "react";
import { useAuthSession } from "@/lib/auth-session";
import { useColors } from "@/hooks/use-colors";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

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

  if (busy) return <View style={[styles.screen, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color={colors.primary} /><Text style={[styles.loading, { color: colors.muted }]}>Preparing your private study space…</Text></View>;

  return <View style={[styles.screen, { backgroundColor: colors.background }]}><View style={styles.content}><Text style={[styles.eyebrow, { color: colors.primary }]}>ROUNDS</Text><Text style={[styles.title, { color: colors.foreground }]}>{mode === "register" ? "Create your study space." : "Welcome back."}</Text><Text style={[styles.body, { color: colors.muted }]}>{mode === "register" ? "Create a Rounds account to save your academic profile and keep study material private." : "Sign in to continue to your private Rounds study space."}</Text><View style={[styles.securityCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.securityTitle, { color: colors.foreground }]}>Private by design</Text><Text style={[styles.securityBody, { color: colors.muted }]}>Your Rounds password is protected with one-way hashing. You can sign out at any time from Settings.</Text></View>{mode === "register" ? <TextInput value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={colors.muted} autoCapitalize="words" style={[styles.input, { color: colors.foreground, borderColor: colors.border }]} accessibilityLabel="Your name" /> : null}<TextInput value={email} onChangeText={setEmail} placeholder="Email address" placeholderTextColor={colors.muted} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" style={[styles.input, { color: colors.foreground, borderColor: colors.border }]} accessibilityLabel="Email address" /><TextInput value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor={colors.muted} secureTextEntry autoCapitalize="none" autoCorrect={false} style={[styles.input, { color: colors.foreground, borderColor: colors.border }]} accessibilityLabel="Password" /><Pressable onPress={() => void submit()} accessibilityRole="button" accessibilityLabel={mode === "register" ? "Create a Rounds account" : "Sign in to Rounds"} style={({ pressed }) => [styles.signIn, { backgroundColor: colors.primary }, pressed && styles.pressed]}><Text style={[styles.signInText, { color: colors.background }]}>{mode === "register" ? "Create Rounds account" : "Sign in to Rounds"}</Text></Pressable><Pressable onPress={() => { setMode(mode === "sign-in" ? "register" : "sign-in"); setFormError(null); }} accessibilityRole="button"><Text style={[styles.switchText, { color: colors.primary }]}>{mode === "sign-in" ? "New to Rounds? Create an account" : "Already have an account? Sign in"}</Text></Pressable>{formError || error ? <Text style={[styles.error, { color: colors.error }]}>{formError ?? "We could not confirm your Rounds session. Please sign in again."}</Text> : null}<Text style={[styles.footnote, { color: colors.muted }]}>Rounds is a study tool and does not provide medical care or official exam scoring.</Text></View></View>;
}

const styles = StyleSheet.create({ screen: { flex: 1, justifyContent: "center", padding: 24 }, content: { gap: 13, maxWidth: 520, width: "100%", alignSelf: "center" }, eyebrow: { fontSize: 12, letterSpacing: 2.4, fontWeight: "900" }, title: { fontFamily: "Georgia", fontSize: 34, lineHeight: 42, fontWeight: "700" }, body: { fontSize: 16, lineHeight: 24 }, securityCard: { borderWidth: 1, borderRadius: 22, padding: 18, gap: 5 }, securityTitle: { fontSize: 16, fontWeight: "900" }, securityBody: { fontSize: 14, lineHeight: 20 }, input: { minHeight: 52, borderWidth: 1, borderRadius: 15, paddingHorizontal: 15, fontSize: 16 }, signIn: { minHeight: 60, borderRadius: 18, justifyContent: "center", alignItems: "center", marginTop: 2 }, signInText: { fontSize: 16, fontWeight: "900" }, switchText: { fontSize: 14, fontWeight: "800", textAlign: "center", paddingVertical: 4 }, error: { fontSize: 13, lineHeight: 19, textAlign: "center" }, footnote: { fontSize: 12, lineHeight: 18, textAlign: "center", marginTop: 4 }, loading: { fontSize: 14, fontWeight: "700", marginTop: 14, textAlign: "center" }, pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] } });

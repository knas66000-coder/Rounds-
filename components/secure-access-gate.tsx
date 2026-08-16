import { startOAuthLogin } from "@/constants/oauth";
import { useAuthSession } from "@/lib/auth-session";
import { useColors } from "@/hooks/use-colors";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

export function SecureAccessGate({ busy = false }: { busy?: boolean }) {
  const colors = useColors();
  const { error } = useAuthSession();
  const signIn = async () => {
    try {
      await startOAuthLogin();
    } catch {
      // The visible error state avoids exposing transport or provider details.
    }
  };

  if (busy) return <View style={[styles.screen, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color={colors.primary} /><Text style={[styles.loading, { color: colors.muted }]}>Preparing your private study space…</Text></View>;

  return <View style={[styles.screen, { backgroundColor: colors.background }]}><View style={styles.content}><Text style={[styles.eyebrow, { color: colors.primary }]}>ROUNDS NCLEX</Text><Text style={[styles.title, { color: colors.foreground }]}>Study with a protected account.</Text><Text style={[styles.body, { color: colors.muted }]}>Sign in to keep your learning space private and access your saved study tools securely.</Text><View style={[styles.securityCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.securityTitle, { color: colors.foreground }]}>Private by design</Text><Text style={[styles.securityBody, { color: colors.muted }]}>Your authenticated session is protected on this device. Sign out at any time from Settings.</Text></View><Pressable onPress={() => void signIn()} accessibilityRole="button" accessibilityLabel="Sign in securely to Rounds NCLEX" style={({ pressed }) => [styles.signIn, { backgroundColor: colors.primary }, pressed && styles.pressed]}><Text style={[styles.signInText, { color: colors.background }]}>Sign in securely</Text></Pressable>{error ? <Text style={[styles.error, { color: colors.error }]}>We could not confirm your session. Please try signing in again.</Text> : null}<Text style={[styles.footnote, { color: colors.muted }]}>Rounds NCLEX is a study tool and does not provide medical care or official exam scoring.</Text></View></View>;
}

const styles = StyleSheet.create({ screen: { flex: 1, justifyContent: "center", padding: 24 }, content: { gap: 18, maxWidth: 520, width: "100%", alignSelf: "center" }, eyebrow: { fontSize: 12, letterSpacing: 2.4, fontWeight: "900" }, title: { fontFamily: "Georgia", fontSize: 34, lineHeight: 42, fontWeight: "700" }, body: { fontSize: 16, lineHeight: 24 }, securityCard: { borderWidth: 1, borderRadius: 22, padding: 18, gap: 5 }, securityTitle: { fontSize: 16, fontWeight: "900" }, securityBody: { fontSize: 14, lineHeight: 20 }, signIn: { minHeight: 60, borderRadius: 18, justifyContent: "center", alignItems: "center" }, signInText: { fontSize: 16, fontWeight: "900" }, error: { fontSize: 13, lineHeight: 19, textAlign: "center" }, footnote: { fontSize: 12, lineHeight: 18, textAlign: "center", marginTop: 4 }, loading: { fontSize: 14, fontWeight: "700", marginTop: 14, textAlign: "center" }, pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] } });

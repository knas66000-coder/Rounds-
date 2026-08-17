import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Speech from "expo-speech";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useAuthSession } from "@/lib/auth-session";
import { trpc } from "@/lib/trpc";
import { clampSpeechRate, defaultVoicePreferences, parseVoicePreferences, VOICE_PREFERENCES_KEY } from "@/lib/voice";

export default function SettingsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user, logout } = useAuthSession();
  const [auto, setAuto] = useState(false);
  const [rate, setRate] = useState(defaultVoicePreferences.rate);
  const [spokenRationale, setSpokenRationale] = useState(defaultVoicePreferences.spokenRationale);
  const notificationPreferences = trpc.notifications.preferences.useQuery();
  const academicProfile = trpc.academicProfile.get.useQuery();
  const updateNotificationPreferences = trpc.notifications.updatePreferences.useMutation({ onSuccess: () => void notificationPreferences.refetch() });
  const notificationSettings = notificationPreferences.data ?? { reactionAlerts: true, replyAlerts: true };

  useEffect(() => {
    AsyncStorage.getItem(VOICE_PREFERENCES_KEY).then((value) => {
      const preferences = parseVoicePreferences(value);
      setRate(preferences.rate);
      setSpokenRationale(preferences.spokenRationale);
    });
  }, []);

  const saveVoicePreferences = (nextRate: number, nextSpokenRationale: boolean) => {
    const preferences = { rate: clampSpeechRate(nextRate), spokenRationale: nextSpokenRationale };
    setRate(preferences.rate);
    setSpokenRationale(preferences.spokenRationale);
    void AsyncStorage.setItem(VOICE_PREFERENCES_KEY, JSON.stringify(preferences));
  };

  const reset = () => Alert.alert("Reset session?", "This removes locally stored practice results.", [{ text: "Cancel", style: "cancel" }, { text: "Reset", style: "destructive", onPress: () => AsyncStorage.removeItem("rounds.session.v1") }]);
  const signOut = () => Alert.alert("Sign out?", "This ends your secure session on this device. Your local study data will remain available when you sign in again.", [{ text: "Cancel", style: "cancel" }, { text: "Sign out", style: "destructive", onPress: () => void logout() }]);

  return (
    <ScreenContainer className="px-5" edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>PREFERENCES</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>Make it yours.</Text>
          <Text style={[styles.sub, { color: colors.muted }]}>Tune practice for your study rhythm.</Text>
        </View>

        <View style={[styles.account, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Text style={[styles.accountLabel, { color: colors.primary }]}>ACCOUNT</Text>
          <Text style={[styles.accountName, { color: colors.foreground }]}>{user?.name || user?.email || "Private learner"}</Text>
          <Text style={[styles.accountText, { color: colors.muted }]}>This device has an active protected session.</Text>
          <Pressable onPress={signOut} accessibilityRole="button" style={[styles.signOut, { borderColor: colors.border }]}><Text style={[styles.signOutText, { color: colors.foreground }]}>Sign out</Text></Pressable>
        </View>

        <View style={[styles.info, { borderColor: colors.border }]}>
          <Text style={[styles.infoTitle, { color: colors.foreground }]}>Academic home</Text>
          <Text style={[styles.infoText, { color: colors.muted }]}>{academicProfile.data ? `${academicProfile.data.institutionName} · ${academicProfile.data.program.replace(/_/g, " ")}` : "Complete your university and program profile to open the correct course pack."}</Text>
          <Pressable onPress={() => router.push("/academic-onboarding" as never)} accessibilityRole="button"><Text style={[styles.test, { color: colors.primary }]}>Change university or program</Text></Pressable>
        </View>

        <View style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SettingRow label="Auto-advance" description="Move to the next question after feedback" right={<Switch value={auto} onValueChange={setAuto} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={colors.background} />} colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingRow label="Speech pace" description={`${rate.toFixed(2)}x · saved for questions, feedback, and rationales`} right={<View style={styles.rateRow}><Pressable onPress={() => saveVoicePreferences(rate - 0.05, spokenRationale)} accessibilityRole="button" accessibilityLabel="Decrease speech pace" style={[styles.rateButton, { borderColor: colors.border }]}><Text style={{ color: colors.foreground }}>−</Text></Pressable><Pressable onPress={() => saveVoicePreferences(rate + 0.05, spokenRationale)} accessibilityRole="button" accessibilityLabel="Increase speech pace" style={[styles.rateButton, { borderColor: colors.border }]}><Text style={{ color: colors.foreground }}>+</Text></Pressable></View>} colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingRow label="Spoken rationale" description="Read the clinical context and why it matters automatically after feedback" right={<Switch value={spokenRationale} onValueChange={(value) => saveVoicePreferences(rate, value)} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={colors.background} accessibilityLabel="Automatically read the clinical rationale after answer feedback" />} colors={colors} />
        </View>

        <View style={[styles.info, { borderColor: colors.border }]}>
          <Text style={[styles.infoTitle, { color: colors.foreground }]}>Community alerts</Text>
          <Text style={[styles.infoText, { color: colors.muted }]}>Private, in-app alerts never include full community post or reply text.</Text>
          <SettingRow label="Encouragement alerts" description="Alert me when another learner encourages my update" right={<Switch value={notificationSettings.reactionAlerts} onValueChange={(reactionAlerts) => updateNotificationPreferences.mutate({ ...notificationSettings, reactionAlerts })} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={colors.background} />} colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingRow label="Reply alerts" description="Alert me when another learner replies to my update" right={<Switch value={notificationSettings.replyAlerts} onValueChange={(replyAlerts) => updateNotificationPreferences.mutate({ ...notificationSettings, replyAlerts })} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={colors.background} />} colors={colors} />
          <Pressable onPress={() => router.push("/notifications")} accessibilityRole="button"><Text style={[styles.test, { color: colors.primary }]}>View notification inbox</Text></Pressable>
        </View>

        <View style={[styles.info, { borderColor: colors.border }]}>
          <Text style={[styles.infoTitle, { color: colors.foreground }]}>Voice practice</Text>
          <Text style={[styles.infoText, { color: colors.muted }]}>Rounds reads each question clearly, records a short answer, then lets you review the transcript before grading. On iOS, turn off Silent Mode to hear speech.</Text>
          <Pressable onPress={() => Speech.speak("Rounds is ready for your next practice question.", { rate, language: "en-US" })} accessibilityRole="button"><Text style={[styles.test, { color: colors.primary }]}>Test current voice pace</Text></Pressable>
        </View>

        <Pressable onPress={reset} accessibilityRole="button" style={[styles.reset, { borderColor: colors.error }]}><Text style={{ color: colors.error, fontWeight: "800" }}>Reset local session results</Text></Pressable>
        <Text style={[styles.version, { color: colors.muted }]}>Rounds NCLEX · Voice-first nursing practice</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

function SettingRow({ label, description, right, colors }: { label: string; description: string; right: React.ReactNode; colors: ReturnType<typeof useColors> }) {
  return <View style={styles.row}><View style={styles.copy}><Text style={[styles.label, { color: colors.foreground }]}>{label}</Text><Text style={[styles.description, { color: colors.muted }]}>{description}</Text></View>{right}</View>;
}

const styles = StyleSheet.create({
  scroll: { paddingTop: 18, paddingBottom: 32 }, header: { gap: 5 }, eyebrow: { fontSize: 12, letterSpacing: 2.2, fontWeight: "800" }, title: { fontFamily: "Georgia", fontSize: 30, fontWeight: "700", marginTop: 3 }, sub: { fontSize: 14, lineHeight: 20 }, account: { marginTop: 22, borderWidth: 1, borderRadius: 20, padding: 17, gap: 5 }, accountLabel: { fontSize: 10, fontWeight: "900", letterSpacing: 1.2 }, accountName: { fontSize: 17, fontWeight: "900" }, accountText: { fontSize: 12, lineHeight: 17 }, signOut: { alignSelf: "flex-start", borderWidth: 1, borderRadius: 12, paddingHorizontal: 13, paddingVertical: 8, marginTop: 5 }, signOutText: { fontSize: 13, fontWeight: "900" }, group: { marginTop: 18, borderWidth: 1, borderRadius: 20, paddingHorizontal: 16 }, row: { minHeight: 74, flexDirection: "row", alignItems: "center", gap: 12 }, copy: { flex: 1, gap: 4 }, label: { fontSize: 16, fontWeight: "800" }, description: { fontSize: 12, lineHeight: 17 }, divider: { height: 1 }, rateRow: { flexDirection: "row", gap: 7 }, rateButton: { width: 34, height: 34, borderWidth: 1, borderRadius: 10, alignItems: "center", justifyContent: "center" }, info: { marginTop: 18, borderWidth: 1, borderRadius: 20, padding: 17, gap: 8 }, infoTitle: { fontSize: 16, fontWeight: "800" }, infoText: { fontSize: 14, lineHeight: 21 }, test: { fontSize: 14, fontWeight: "800", marginTop: 2 }, reset: { marginTop: 18, minHeight: 48, borderWidth: 1, borderRadius: 16, alignItems: "center", justifyContent: "center" }, version: { textAlign: "center", fontSize: 12, marginTop: 18 },
});

import { useEffect, useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useAuthSession } from "@/lib/auth-session";
import { trpc } from "@/lib/trpc";
import { shareRoundsAccountExport } from "@/lib/account-export";
import { collectLocalStudyData, encryptLocalStudyBackup, shareEncryptedLocalStudyBackup, validateBackupPassphrase } from "@/lib/local-backup";
import { usePrivateClonedVoice } from "@/lib/private-cloned-voice";
import { PRIVATE_CLONE_DEFAULT_PROFILE } from "@/lib/private-cloned-voice-core";
import { BIOMETRIC_UNLOCK_KEY, parseBiometricUnlock } from "@/shared/account-privacy";

export default function SettingsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user, logout } = useAuthSession();
  const [auto, setAuto] = useState(false);
  const [voiceServiceUrl, setVoiceServiceUrl] = useState("");
  const [voiceProfileId, setVoiceProfileId] = useState(PRIVATE_CLONE_DEFAULT_PROFILE);
  const [voiceServiceToken, setVoiceServiceToken] = useState("");
  const [isSavingVoiceConnection, setIsSavingVoiceConnection] = useState(false);
  const [biometricUnlock, setBiometricUnlock] = useState(false);
  const [backupPassphrase, setBackupPassphrase] = useState("");
  const [backupConfirmation, setBackupConfirmation] = useState("");
  const [backupProblem, setBackupProblem] = useState<string | null>(null);
  const [isPreparingBackup, setIsPreparingBackup] = useState(false);
  const { connection: privateVoiceConnection, isConfigured: privateVoiceConfigured, isPlaying: privateVoicePlaying, saveConnection: savePrivateVoiceConnection, clearConnection: clearPrivateVoiceConnection, speak: speakInPrivateVoice, stop: stopPrivateVoice } = usePrivateClonedVoice();
  const notificationPreferences = trpc.notifications.preferences.useQuery(undefined, { enabled: Boolean(user) });
  const academicProfile = trpc.academicProfile.get.useQuery(undefined, { enabled: Boolean(user) });
  const accountExport = trpc.roundsAccount.exportData.useQuery(undefined, { enabled: false });
  const updateNotificationPreferences = trpc.notifications.updatePreferences.useMutation({ onSuccess: () => void notificationPreferences.refetch() });
  const notificationSettings = notificationPreferences.data ?? { reactionAlerts: true, replyAlerts: true };

  useEffect(() => {
    AsyncStorage.getItem(BIOMETRIC_UNLOCK_KEY).then((value) => setBiometricUnlock(parseBiometricUnlock(value)));
  }, []);

  useEffect(() => {
    setVoiceServiceUrl(privateVoiceConnection.serviceUrl);
    setVoiceProfileId(privateVoiceConnection.voiceProfileId);
    setVoiceServiceToken(privateVoiceConnection.token);
  }, [privateVoiceConnection.serviceUrl, privateVoiceConnection.token, privateVoiceConnection.voiceProfileId]);

  const savePrivateVoice = async () => {
    setIsSavingVoiceConnection(true);
    try {
      await savePrivateVoiceConnection({ serviceUrl: voiceServiceUrl, voiceProfileId, token: voiceServiceToken });
      Alert.alert("Private cloned voice connected", "Rounds will use your configured private cloned voice whenever it reads text aloud.");
    } catch (error) {
      Alert.alert("Private voice not saved", error instanceof Error ? error.message : "Check the private service address and access token.");
    } finally {
      setIsSavingVoiceConnection(false);
    }
  };
  const previewPrivateVoice = async () => {
    try {
      await speakInPrivateVoice("Rounds is ready. Check blood pressure, S P O two, and medication safety before answering.");
    } catch (error) {
      Alert.alert("Cloned speech unavailable", error instanceof Error ? error.message : "The private voice service could not be reached.");
    }
  };
  const removePrivateVoice = () => Alert.alert("Remove private cloned voice?", "Rounds will keep text visible but will not switch to a phone voice.", [{ text: "Cancel", style: "cancel" }, { text: "Remove", style: "destructive", onPress: () => void clearPrivateVoiceConnection() }]);

  const reset = () => Alert.alert("Reset session?", "This removes locally stored practice results.", [{ text: "Cancel", style: "cancel" }, { text: "Reset", style: "destructive", onPress: () => AsyncStorage.removeItem("rounds.session.v1") }]);
  const signOut = () => Alert.alert("Sign out?", "This ends your secure session on this device. Your local study data will remain available when you sign in again.", [{ text: "Cancel", style: "cancel" }, { text: "Sign out", style: "destructive", onPress: () => void logout() }]);
  const setBiometricProtection = async (next: boolean) => {
    if (!next) { setBiometricUnlock(false); await AsyncStorage.setItem(BIOMETRIC_UNLOCK_KEY, "false"); return; }
    if (Platform.OS === "web") { Alert.alert("Available in the installed app", "Biometric unlock is available on iOS and Android after installing Rounds."); return; }
    const [hasHardware, enrolled] = await Promise.all([LocalAuthentication.hasHardwareAsync(), LocalAuthentication.isEnrolledAsync()]);
    if (!hasHardware || !enrolled) { Alert.alert("Biometrics unavailable", "Set up Face ID, Touch ID, or fingerprint on this device first. Your Rounds password remains available."); return; }
    setBiometricUnlock(true);
    await AsyncStorage.setItem(BIOMETRIC_UNLOCK_KEY, "true");
  };
  const exportPrivateData = async () => {
    try {
      const response = await accountExport.refetch();
      if (!response.data) throw new Error("Your account data is not available right now.");
      await shareRoundsAccountExport(response.data);
    } catch (exportError) {
      Alert.alert("Export unavailable", exportError instanceof Error ? exportError.message : "Try again while connected to the internet.");
    }
  };
  const exportLocalStudyBackup = async () => {
    const problem = validateBackupPassphrase(backupPassphrase, backupConfirmation);
    if (problem) { setBackupProblem(problem); return; }
    setBackupProblem(null);
    setIsPreparingBackup(true);
    try {
      const studyData = await collectLocalStudyData();
      const encryptedBackup = await encryptLocalStudyBackup(studyData, backupPassphrase);
      await shareEncryptedLocalStudyBackup(encryptedBackup);
      setBackupPassphrase("");
      setBackupConfirmation("");
      Alert.alert("Encrypted backup ready", "Your .rounds backup was prepared on this device. Save it somewhere you control, and keep its passphrase separately. Rounds cannot recover a forgotten passphrase.");
    } catch (backupError) {
      setBackupProblem(backupError instanceof Error ? backupError.message : "Rounds could not prepare the backup. Please try again.");
    } finally {
      setIsPreparingBackup(false);
    }
  };

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
          <Text style={[styles.infoTitle, { color: colors.foreground }]}>Privacy and access</Text>
          <Text style={[styles.infoText, { color: colors.muted }]}>Download your profile, course-material metadata, and your own community activity. Passwords, session tokens, private PDF contents, and storage keys are never included.</Text>
          <Pressable onPress={() => void exportPrivateData()} accessibilityRole="button"><Text style={[styles.test, { color: colors.primary }]}>{accountExport.isFetching ? "Preparing private export…" : "Download private account data"}</Text></Pressable>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingRow label="Biometric unlock" description="After one minute in the background, use device biometrics to reopen Rounds. Your password remains the fallback." right={<Switch value={biometricUnlock} onValueChange={(value) => void setBiometricProtection(value)} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={colors.background} accessibilityLabel="Enable biometric unlock" />} colors={colors} />
        </View>

        <View style={[styles.info, { borderColor: colors.border }]}> 
          <Text style={[styles.infoTitle, { color: colors.foreground }]}>Encrypted study backup</Text>
          <Text style={[styles.infoText, { color: colors.muted }]}>Create a passphrase-protected .rounds file containing your on-device learning profile, installed packs, practice results, saved questions and topics, progress, drafts, and study preferences. Rounds never uploads this file or remembers the passphrase.</Text>
          <Text style={[styles.backupWarning, { color: colors.warning }]}>Keep the file and passphrase separately. If either is lost, Rounds cannot recover the backup.</Text>
          <TextInput value={backupPassphrase} onChangeText={(value) => { setBackupPassphrase(value); setBackupProblem(null); }} secureTextEntry autoCapitalize="none" autoCorrect={false} textContentType="password" placeholder="Create a backup passphrase" placeholderTextColor={colors.muted} style={[styles.backupInput, { borderColor: colors.border, backgroundColor: colors.background, color: colors.foreground }]} accessibilityLabel="Backup passphrase" />
          <TextInput value={backupConfirmation} onChangeText={(value) => { setBackupConfirmation(value); setBackupProblem(null); }} secureTextEntry autoCapitalize="none" autoCorrect={false} textContentType="password" placeholder="Confirm backup passphrase" placeholderTextColor={colors.muted} style={[styles.backupInput, { borderColor: colors.border, backgroundColor: colors.background, color: colors.foreground }]} accessibilityLabel="Confirm backup passphrase" returnKeyType="done" onSubmitEditing={() => void exportLocalStudyBackup()} />
          {backupProblem ? <Text style={[styles.backupProblem, { color: colors.error }]}>{backupProblem}</Text> : null}
          <Pressable onPress={() => void exportLocalStudyBackup()} disabled={isPreparingBackup} accessibilityRole="button" style={({ pressed }) => [styles.backupButton, { backgroundColor: colors.primary }, (pressed || isPreparingBackup) && { opacity: 0.82, transform: [{ scale: 0.98 }] }]}><Text style={[styles.backupButtonText, { color: colors.background }]}>{isPreparingBackup ? "Encrypting your backup…" : "Export encrypted study backup"}</Text></Pressable>
        </View>

        <View style={[styles.info, { borderColor: colors.border }]}>
          <Text style={[styles.infoTitle, { color: colors.foreground }]}>Learning portals</Text>
          <Text style={[styles.infoText, { color: colors.muted }]}>Choose a separate University or High School portal before browsing packs. Nursing is part of University; Uganda high-school subjects remain in the High School portal.</Text>
          <Pressable onPress={() => router.push("/learning-portals" as never)} accessibilityRole="button"><Text style={[styles.test, { color: colors.primary }]}>Open learning portals</Text></Pressable>
        </View>

        <View testID="learning-preferences" style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SettingRow label="Auto-advance" description="Move to the next question after feedback" right={<Switch value={auto} onValueChange={setAuto} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={colors.background} />} colors={colors} />
        </View>

        <View style={[styles.info, { borderColor: colors.border }]}> 
          <Text style={[styles.infoTitle, { color: colors.foreground }]}>Private cloned voice</Text>
          <Text style={[styles.infoText, { color: colors.muted }]}>Every Rounds read-aloud feature uses your configured private cloned voice. Your phone does not select or generate the speech. The access token is stored in protected device storage.</Text>
          <TextInput value={voiceServiceUrl} onChangeText={setVoiceServiceUrl} autoCapitalize="none" autoCorrect={false} keyboardType="url" placeholder="https://your-private-voice-service" placeholderTextColor={colors.muted} style={[styles.backupInput, { borderColor: colors.border, backgroundColor: colors.background, color: colors.foreground }]} accessibilityLabel="Private cloned-voice service HTTPS address" />
          <TextInput value={voiceProfileId} onChangeText={setVoiceProfileId} autoCapitalize="none" autoCorrect={false} placeholder="owner-primary" placeholderTextColor={colors.muted} style={[styles.backupInput, { borderColor: colors.border, backgroundColor: colors.background, color: colors.foreground }]} accessibilityLabel="Private cloned-voice profile identifier" />
          <TextInput value={voiceServiceToken} onChangeText={setVoiceServiceToken} secureTextEntry autoCapitalize="none" autoCorrect={false} textContentType="password" placeholder="Private service access token" placeholderTextColor={colors.muted} style={[styles.backupInput, { borderColor: colors.border, backgroundColor: colors.background, color: colors.foreground }]} accessibilityLabel="Private cloned-voice service access token" />
          <Text style={[styles.selectedVoiceDetails, { color: privateVoiceConfigured ? colors.success : colors.warning }]}>{privateVoiceConfigured ? `Connected · ${privateVoiceConnection.voiceProfileId}` : "Not connected · Rounds keeps text visible and will not switch to phone speech."}</Text>
          <View style={styles.actionRow}><Pressable onPress={() => void savePrivateVoice()} disabled={isSavingVoiceConnection} accessibilityRole="button" style={[styles.voiceUseButton, { backgroundColor: colors.primary, borderColor: colors.primary }]}><Text style={{ color: colors.background, fontSize: 11, fontWeight: "900" }}>{isSavingVoiceConnection ? "Saving…" : "Save connection"}</Text></Pressable><Pressable onPress={() => void previewPrivateVoice()} disabled={!privateVoiceConfigured || privateVoicePlaying} accessibilityRole="button" style={[styles.voiceUseButton, { backgroundColor: colors.background, borderColor: colors.primary }, (!privateVoiceConfigured || privateVoicePlaying) && styles.dimmed]}><Text style={{ color: colors.primary, fontSize: 11, fontWeight: "900" }}>{privateVoicePlaying ? "Speaking…" : "Test voice"}</Text></Pressable>{privateVoicePlaying ? <Pressable onPress={() => void stopPrivateVoice()} accessibilityRole="button"><Text style={[styles.preview, { color: colors.primary }]}>Stop</Text></Pressable> : null}</View>
          {privateVoiceConfigured ? <Pressable onPress={removePrivateVoice} accessibilityRole="button"><Text style={[styles.preview, { color: colors.error }]}>Remove private voice connection</Text></Pressable> : null}
        </View>

        <View style={[styles.info, { borderColor: colors.border }]}>
          <Text style={[styles.infoTitle, { color: colors.foreground }]}>Community alerts</Text>
          <Text style={[styles.infoText, { color: colors.muted }]}>Private, in-app alerts never include full community post or reply text.</Text>
          <SettingRow label="Encouragement alerts" description="Alert me when another learner encourages my update" right={<Switch value={notificationSettings.reactionAlerts} onValueChange={(reactionAlerts) => updateNotificationPreferences.mutate({ ...notificationSettings, reactionAlerts })} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={colors.background} />} colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingRow label="Reply alerts" description="Alert me when another learner replies to my update" right={<Switch value={notificationSettings.replyAlerts} onValueChange={(replyAlerts) => updateNotificationPreferences.mutate({ ...notificationSettings, replyAlerts })} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={colors.background} />} colors={colors} />
          <Pressable onPress={() => router.push("/notifications")} accessibilityRole="button"><Text style={[styles.test, { color: colors.primary }]}>View notification inbox</Text></Pressable>
        </View>

        <View testID="private-cloned-voice-settings" style={[styles.info, { borderColor: colors.border }]}>
          <Text style={[styles.infoTitle, { color: colors.foreground }]}>Voice practice</Text>
          <Text style={[styles.infoText, { color: colors.muted }]}>Rounds reads each question through your private cloned voice, records a short answer, then lets you review the transcript before grading.</Text>
          <Pressable onPress={() => void previewPrivateVoice()} disabled={!privateVoiceConfigured || privateVoicePlaying} accessibilityRole="button" style={!privateVoiceConfigured || privateVoicePlaying ? styles.dimmed : undefined}><Text style={[styles.test, { color: colors.primary }]}>{privateVoicePlaying ? "Private voice is speaking…" : "Test private cloned voice"}</Text></Pressable>
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

const styles: Record<string, any> = StyleSheet.create({
  scroll: { paddingTop: 18, paddingBottom: 32 }, header: { gap: 5 }, eyebrow: { fontSize: 12, letterSpacing: 2.2, fontWeight: "800" }, title: { fontFamily: "Georgia", fontSize: 30, fontWeight: "700", marginTop: 3 }, sub: { fontSize: 14, lineHeight: 20 }, account: { marginTop: 22, borderWidth: 1, borderRadius: 20, padding: 17, gap: 5 }, accountLabel: { fontSize: 10, fontWeight: "900", letterSpacing: 1.2 }, accountName: { fontSize: 17, fontWeight: "900" }, accountText: { fontSize: 12, lineHeight: 17 }, signOut: { alignSelf: "flex-start", borderWidth: 1, borderRadius: 12, paddingHorizontal: 13, paddingVertical: 8, marginTop: 5 }, signOutText: { fontSize: 13, fontWeight: "900" }, group: { marginTop: 18, borderWidth: 1, borderRadius: 20, paddingHorizontal: 16 }, row: { minHeight: 74, flexDirection: "row", alignItems: "center", gap: 12 }, copy: { flex: 1, gap: 4 }, grow: { flex: 1 }, label: { fontSize: 16, fontWeight: "800" }, description: { fontSize: 12, lineHeight: 17 }, divider: { height: 1 }, rateRow: { flexDirection: "row", gap: 7 }, rateButton: { width: 34, height: 34, borderWidth: 1, borderRadius: 10, alignItems: "center", justifyContent: "center" }, info: { marginTop: 18, borderWidth: 1, borderRadius: 20, padding: 17, gap: 8 }, infoTitle: { fontSize: 16, fontWeight: "800" }, infoText: { fontSize: 14, lineHeight: 21 }, test: { fontSize: 14, fontWeight: "800", marginTop: 2 }, backupWarning: { fontSize: 12, lineHeight: 18, fontWeight: "700" }, backupInput: { minHeight: 48, borderWidth: 1, borderRadius: 13, paddingHorizontal: 13, fontSize: 14 }, backupProblem: { fontSize: 12, lineHeight: 18, fontWeight: "700" }, backupButton: { minHeight: 50, borderRadius: 15, alignItems: "center", justifyContent: "center", marginTop: 2 }, backupButtonText: { fontSize: 14, fontWeight: "900" }, selectedVoice: { borderWidth: 1, borderRadius: 14, padding: 12, gap: 3 }, selectedVoiceLabel: { fontSize: 10, letterSpacing: 1.1, fontWeight: "900" }, selectedVoiceName: { fontSize: 15, fontWeight: "900" }, selectedVoiceDetails: { fontSize: 12, lineHeight: 17 }, voiceOption: { minHeight: 55, borderWidth: 1, borderRadius: 13, padding: 10, flexDirection: "row", alignItems: "center", gap: 9 }, voiceOptionName: { fontSize: 13, fontWeight: "800" }, voiceOptionDetails: { fontSize: 11, marginTop: 2 }, voiceUseButton: { minWidth: 62, minHeight: 32, borderWidth: 1, borderRadius: 10, alignItems: "center", justifyContent: "center", paddingHorizontal: 8 }, preview: { fontSize: 11, fontWeight: "900" }, noVoice: { fontSize: 13, lineHeight: 19, fontWeight: "700" }, voiceLimit: { fontSize: 11, lineHeight: 16 }, reset: { marginTop: 18, minHeight: 48, borderWidth: 1, borderRadius: 16, alignItems: "center", justifyContent: "center" }, version: { textAlign: "center", fontSize: 12, marginTop: 18 },
});

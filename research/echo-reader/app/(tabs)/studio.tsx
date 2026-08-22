import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from "expo-audio";
import { Directory, File, Paths } from "expo-file-system";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

const RECORDING_LINES = [
  "Hello. My voice is clear, calm, and natural.",
  "What would you like me to read?",
  "I can help you find a passage in this document.",
  "The following passage is from page one of the current document.",
  "Please continue from the heading called Installation.",
  "Search this document for the phrase user guide.",
  "Read chapter two, section four, paragraph three.",
  "Your documents stay on this device.",
  "Please ask your document question now.",
  "I have finished reading the selected passage.",
];

const RECORDING_MANIFEST_KEY = "echo-reader.voice-recording-manifest.v1";

type LocalRecording = {
  lineIndex: number;
  transcript: string;
  uri: string;
  recordedAt: number;
};

export default function VoiceStudioScreen() {
  const colors = useColors();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const [lineIndex, setLineIndex] = useState(0);
  const [completedLines, setCompletedLines] = useState<number[]>([]);
  const [recordings, setRecordings] = useState<LocalRecording[]>([]);
  const [lastSavedUri, setLastSavedUri] = useState<string | null>(null);
  const [notice, setNotice] = useState("Read one line at a time in a quiet room.");

  const currentLine = RECORDING_LINES[lineIndex];
  const progress = useMemo(() => Math.round((completedLines.length / RECORDING_LINES.length) * 100), [completedLines.length]);

  useEffect(() => {
    const restoreRecordingManifest = async () => {
      try {
        const storedManifest = await AsyncStorage.getItem(RECORDING_MANIFEST_KEY);
        if (!storedManifest) return;
        const restoredRecordings = JSON.parse(storedManifest) as LocalRecording[];
        setRecordings(restoredRecordings);
        setCompletedLines(restoredRecordings.map((recording) => recording.lineIndex));
        if (restoredRecordings.length > 0) {
          setNotice(`${restoredRecordings.length} local recording${restoredRecordings.length === 1 ? "" : "s"} restored. Continue from any line.`);
        }
      } catch {
        setNotice("Read one line at a time in a quiet room.");
      }
    };
    void restoreRecordingManifest();
  }, []);

  const toggleRecording = async () => {
    try {
      if (recorderState.isRecording) {
        await recorder.stop();
        if (!recorder.uri) throw new Error("No local audio file was created.");
        const datasetDirectory = new Directory(Paths.document, "echo-voice-dataset");
        datasetDirectory.create({ idempotent: true, intermediates: true });
        const destination = new File(datasetDirectory, `ug-en-${String(lineIndex + 1).padStart(3, "0")}-${Date.now()}.m4a`);
        new File(recorder.uri).copy(destination);
        const savedRecording: LocalRecording = {
          lineIndex,
          transcript: currentLine,
          uri: destination.uri,
          recordedAt: Date.now(),
        };
        const nextRecordings = [...recordings.filter((recording) => recording.lineIndex !== lineIndex), savedRecording];
        setRecordings(nextRecordings);
        setLastSavedUri(destination.uri);
        setCompletedLines(nextRecordings.map((recording) => recording.lineIndex));
        await AsyncStorage.setItem(RECORDING_MANIFEST_KEY, JSON.stringify(nextRecordings));
        setNotice("Saved privately on this device. Continue when you are ready.");
        return;
      }

      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        setNotice("Microphone permission is needed only to record your custom voice dataset.");
        return;
      }

      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setNotice("Recording locally. Read the line once, then tap Stop.");
    } catch {
      Alert.alert("Recording unavailable", "Please try again after checking microphone permission.");
      setNotice("The recording could not be started on this device.");
    }
  };

  const advanceLine = () => {
    setLineIndex((current) => (current + 1) % RECORDING_LINES.length);
    setLastSavedUri(null);
    setNotice("Read the next line naturally, then save it.");
  };

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <MaterialIcons name="graphic-eq" size={22} color={colors.primary} />
          </View>
          <View style={styles.headerCopy}>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>YOUR VOICE DATASET</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>Voice Studio</Text>
          </View>
        </View>

        <View style={[styles.privacyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <MaterialIcons name="verified-user" size={20} color={colors.success} />
          <Text style={[styles.privacyText, { color: colors.muted }]}>Only your consented recordings belong in this dataset. This recorder does not use a phone speech voice or remote speech service.</Text>
        </View>

        <View style={[styles.progressCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.progressLabelRow}>
            <Text style={[styles.progressTitle, { color: colors.foreground }]}>First recording set</Text>
            <Text style={[styles.progressValue, { color: colors.primary }]}>{completedLines.length}/{RECORDING_LINES.length}</Text>
          </View>
          <View style={[styles.track, { backgroundColor: colors.border }]}>
            <View style={[styles.fill, { backgroundColor: colors.primary, width: `${progress}%` }]} />
          </View>
          <Text style={[styles.progressHint, { color: colors.muted }]}>This starter set validates tone and recording consistency. The full training set uses the complete Ugandan English guide.</Text>
        </View>

        <View style={styles.lineHeading}>
          <Text style={[styles.lineLabel, { color: colors.muted }]}>LINE {String(lineIndex + 1).padStart(2, "0")}</Text>
          <Text style={[styles.languagePill, { color: colors.primary, borderColor: colors.primary }]}>Ugandan English</Text>
        </View>
        <View style={[styles.scriptCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.script, { color: colors.foreground }]}>{currentLine}</Text>
        </View>

        <Pressable onPress={toggleRecording} style={({ pressed }) => [styles.recordButton, { backgroundColor: recorderState.isRecording ? colors.error : colors.primary }, pressed && styles.pressed]}>
          <MaterialIcons name={recorderState.isRecording ? "stop" : "mic"} size={28} color="#FFFFFF" />
          <Text style={styles.recordText}>{recorderState.isRecording ? "Stop and save" : "Record this line"}</Text>
        </Pressable>

        <Text style={[styles.notice, { color: colors.muted }]}>{notice}</Text>
        {lastSavedUri ? <Text style={[styles.saved, { color: colors.success }]}>Recording captured for this session.</Text> : null}

        <Pressable onPress={advanceLine} style={({ pressed }) => [styles.nextButton, { borderColor: colors.border }, pressed && styles.pressed]}>
          <Text style={[styles.nextText, { color: colors.foreground }]}>Next line</Text>
          <MaterialIcons name="arrow-forward" size={20} color={colors.foreground} />
        </Pressable>

        <View style={styles.tipSection}>
          <Text style={[styles.tipTitle, { color: colors.foreground }]}>Good recording habits</Text>
          <Text style={[styles.tipText, { color: colors.muted }]}>Record in a quiet room, keep the phone 15–20 centimetres from your mouth, and repeat the whole line if you make a mistake. Consistency matters more than speed.</Text>
        </View>

        <View style={[styles.cloneCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cloneHeading}>
            <View style={[styles.cloneIcon, { backgroundColor: "rgba(79,209,197,0.14)" }]}>
              <MaterialIcons name="psychology" size={19} color={colors.success} />
            </View>
            <View style={styles.cloneHeadingText}>
              <Text style={[styles.cloneTitle, { color: colors.foreground }]}>Local voice-clone preview</Text>
              <Text style={[styles.cloneStatus, { color: colors.warning }]}>Reference clip required</Text>
            </View>
          </View>
          <Text style={[styles.cloneCopy, { color: colors.muted }]}>This experimental preview will use a bundled on-device model, never the phone voice. Record one clean 8–15 second Echo Reader guide clip with its exact transcript before activation.</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 22, paddingBottom: 32, gap: 18 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBadge: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(124,108,255,0.13)" },
  headerCopy: { flex: 1 },
  eyebrow: { fontSize: 11, fontWeight: "800", letterSpacing: 1.3 },
  title: { fontSize: 29, lineHeight: 35, fontWeight: "800", letterSpacing: -0.6 },
  privacyCard: { flexDirection: "row", gap: 10, alignItems: "flex-start", borderWidth: 1, borderRadius: 16, padding: 14 },
  privacyText: { flex: 1, fontSize: 13, lineHeight: 19, fontWeight: "500" },
  progressCard: { borderWidth: 1, borderRadius: 18, padding: 16, gap: 11 },
  progressLabelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  progressTitle: { fontSize: 15, fontWeight: "700" },
  progressValue: { fontSize: 14, fontWeight: "800" },
  track: { height: 8, borderRadius: 999, overflow: "hidden" },
  fill: { height: 8, borderRadius: 999 },
  progressHint: { fontSize: 12, lineHeight: 18 },
  lineHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  lineLabel: { fontSize: 11, letterSpacing: 1.4, fontWeight: "800" },
  languagePill: { fontSize: 11, fontWeight: "700", borderWidth: 1, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 99 },
  scriptCard: { borderWidth: 1, borderRadius: 22, padding: 22, minHeight: 150, justifyContent: "center" },
  script: { fontSize: 25, lineHeight: 34, fontWeight: "600", letterSpacing: -0.3 },
  recordButton: { minHeight: 62, borderRadius: 20, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 10 },
  recordText: { color: "#FFFFFF", fontSize: 17, fontWeight: "800" },
  pressed: { opacity: 0.84, transform: [{ scale: 0.98 }] },
  notice: { textAlign: "center", fontSize: 13, lineHeight: 19, paddingHorizontal: 12 },
  saved: { textAlign: "center", fontSize: 13, fontWeight: "700" },
  nextButton: { height: 52, borderRadius: 16, borderWidth: 1, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  nextText: { fontSize: 15, fontWeight: "700" },
  tipSection: { marginTop: 8, paddingHorizontal: 4, gap: 5 },
  tipTitle: { fontSize: 15, fontWeight: "800" },
  tipText: { fontSize: 13, lineHeight: 20 },
  cloneCard: { borderWidth: 1, borderRadius: 18, padding: 16, gap: 10 },
  cloneHeading: { flexDirection: "row", alignItems: "center", gap: 10 },
  cloneIcon: { width: 35, height: 35, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cloneHeadingText: { flex: 1 },
  cloneTitle: { fontSize: 15, fontWeight: "800" },
  cloneStatus: { fontSize: 11, fontWeight: "800", letterSpacing: 0.6, marginTop: 2 },
  cloneCopy: { fontSize: 13, lineHeight: 20 },
});

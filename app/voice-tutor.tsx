import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import * as Speech from "expo-speech";
import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from "expo-audio";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useRoundsVoice } from "@/hooks/use-rounds-voice";
import { encodeRecordedAudio } from "@/lib/audio-encoding";
import { prepareLocalSpeech } from "@/lib/voice";
import { trpc } from "@/lib/trpc";
import type { VoiceTutorAction, VoiceTutorTurn } from "@/shared/voice-tutor";

type ConversationTurn = VoiceTutorTurn & { action?: VoiceTutorAction; safetyRedirect?: boolean };
type TutorPhase = "ready" | "listening" | "transcribing" | "thinking" | "speaking";

export default function VoiceTutorScreen() {
  const colors = useColors();
  const router = useRouter();
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [draft, setDraft] = useState("");
  const [phase, setPhase] = useState<TutorPhase>("ready");
  const [notice, setNotice] = useState("Speak or type a Nursing study question. You can review your transcript before sending it.");
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const recorderRef = useRef(recorder);
  const recordingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transcribeMutation = trpc.voice.transcribe.useMutation();
  const respondMutation = trpc.voiceTutor.respond.useMutation();
  const { speechOptions } = useRoundsVoice();
  const recordingSeconds = Math.min(12, Math.max(0, Math.ceil((recorderState.durationMillis ?? 0) / 1000)));

  useEffect(() => { recorderRef.current = recorder; }, [recorder]);

  useEffect(() => {
    return () => {
      void Speech.stop();
      if (recordingTimer.current) clearTimeout(recordingTimer.current);
      if (recorderRef.current.isRecording) void recorderRef.current.stop();
    };
  }, []);

  const stopVoice = async () => {
    await Speech.stop();
    if (phase === "speaking") setPhase("ready");
    setNotice("Voice stopped. Speak or type another study question when you are ready.");
  };

  const speakTutorReply = async (reply: string) => {
    await Speech.stop();
    if (!speechOptions) {
      setPhase("ready");
      setNotice("Your reply is ready to read. Install or choose an English device voice in Settings to hear Rounds aloud.");
      return;
    }
    setPhase("speaking");
    Speech.speak(prepareLocalSpeech(reply), {
      ...speechOptions,
      onDone: () => setPhase("ready"),
      onStopped: () => setPhase("ready"),
      onError: () => { setPhase("ready"); setNotice("The reply is ready to read, but device speech could not start."); },
    });
  };

  const beginRecording = async () => {
    try {
      await Speech.stop();
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        setNotice("Microphone access is off. Type your study question below instead.");
        return;
      }
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setPhase("listening");
      setNotice("Listening for your study question. Tap stop when you finish.");
      if (recordingTimer.current) clearTimeout(recordingTimer.current);
      recordingTimer.current = setTimeout(() => void stopAndTranscribe(), 12000);
    } catch {
      setPhase("ready");
      setNotice("The microphone could not start. Type your question below instead.");
    }
  };

  const stopAndTranscribe = async () => {
    if (recordingTimer.current) clearTimeout(recordingTimer.current);
    try {
      setPhase("transcribing");
      const originalUri = recorder.uri;
      await recorder.stop();
      const recordingUri = recorder.uri ?? originalUri;
      if (!recordingUri) throw new Error("No recording available");
      const response = await transcribeMutation.mutateAsync(await encodeRecordedAudio(recordingUri));
      const transcript = response.text?.trim();
      if (!transcript) throw new Error("No speech recognized");
      setDraft(transcript);
      setPhase("ready");
      setNotice("Transcript ready. Review or edit it, then send it to Rounds.");
    } catch {
      setPhase("ready");
      setNotice("We could not transcribe that question. Try again or use the typed option.");
    }
  };

  const sendToTutor = async () => {
    const message = draft.trim();
    if (message.length < 2) {
      Alert.alert("Add a study question", "Speak to Rounds or type a Nursing study question before sending.");
      return;
    }
    await Speech.stop();
    const history = turns.slice(-6).map(({ role, content }) => ({ role, content }));
    setTurns((current) => [...current, { role: "user", content: message }]);
    setDraft("");
    setPhase("thinking");
    setNotice("Rounds is preparing a concise study response.");
    try {
      const response = await respondMutation.mutateAsync({ message, history });
      setTurns((current) => [...current, { role: "assistant", content: response.reply, action: response.action, safetyRedirect: response.safetyRedirect }]);
      setNotice(response.safetyRedirect ? "Rounds provided a safety redirect instead of a clinical decision." : "Reply ready. Rounds is reading it aloud.");
      await speakTutorReply(response.reply);
    } catch {
      setPhase("ready");
      setNotice("Rounds could not connect right now. Your installed study tools are still available.");
    }
  };

  const openAction = (action: VoiceTutorAction | undefined) => {
    void Speech.stop();
    if (action === "oral_exam") router.push("/oral-exam");
    if (action === "adaptive_review") router.push("/adaptive-review");
    if (action === "pdf_reader") router.push("/study-materials");
  };

  const clearConversation = () => {
    void Speech.stop();
    setTurns([]);
    setDraft("");
    setPhase("ready");
    setNotice("Conversation cleared from this screen. Nothing was saved to your Rounds account.");
  };

  const isBusy = phase === "listening" || phase === "transcribing" || phase === "thinking";
  const actionLabel = (action: VoiceTutorAction | undefined) => action === "oral_exam" ? "Open Oral Exam" : action === "adaptive_review" ? "Open Adaptive Review" : action === "pdf_reader" ? "Open Study Materials" : null;

  return (
    <ScreenContainer className="px-5" edges={["top", "left", "right"]}>
      <FlatList
        data={turns}
        keyExtractor={(_, index) => `voice-turn-${index}`}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={<><Pressable onPress={() => { void Speech.stop(); router.back(); }} accessibilityRole="button"><Text style={[styles.back, { color: colors.primary }]}>‹ Study tools</Text></Pressable><View style={styles.header}><Text style={[styles.eyebrow, { color: colors.primary }]}>ROUNDS VOICE TUTOR</Text><Text style={[styles.title, { color: colors.foreground }]}>Talk through a study topic.</Text><Text style={[styles.sub, { color: colors.muted }]}>Speak a Nursing study question, check the transcript, then hear a concise Rounds response. This is study support, not patient-specific clinical direction.</Text></View><View style={[styles.statusCard, { borderColor: colors.primary, backgroundColor: colors.surface }]}><Text style={[styles.statusLabel, { color: colors.primary }]}>{phase === "listening" ? `LISTENING · ${recordingSeconds}s / 12s` : phase === "transcribing" ? "TRANSCRIBING" : phase === "thinking" ? "PREPARING RESPONSE" : phase === "speaking" ? "ROUNDS IS SPEAKING" : "READY"}</Text><Text style={[styles.statusCopy, { color: colors.muted }]}>{notice}</Text>{phase === "speaking" ? <Pressable onPress={() => void stopVoice()} accessibilityRole="button" style={[styles.stopVoice, { borderColor: colors.primary }]}><Text style={[styles.stopVoiceText, { color: colors.primary }]}>Stop voice</Text></Pressable> : null}</View>{turns.length === 0 ? <View style={[styles.welcomeCard, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={[styles.welcomeTitle, { color: colors.foreground }]}>Try a focused learning question</Text><Text style={[styles.welcomeText, { color: colors.muted }]}>For example: “Explain why hand hygiene matters before medication administration,” or “Help me choose a topic for oral practice.”</Text></View> : null}</>}
        renderItem={({ item }) => <View style={[styles.bubble, item.role === "user" ? [styles.userBubble, { backgroundColor: colors.primary }] : [styles.tutorBubble, { borderColor: item.safetyRedirect ? colors.warning : colors.border, backgroundColor: colors.surface }]]}><Text style={[styles.bubbleLabel, { color: item.role === "user" ? colors.background : item.safetyRedirect ? colors.warning : colors.primary }]}>{item.role === "user" ? "YOU" : item.safetyRedirect ? "SAFETY NOTE" : "ROUNDS"}</Text><Text style={[styles.bubbleText, { color: item.role === "user" ? colors.background : colors.foreground }]}>{item.content}</Text>{actionLabel(item.action) ? <Pressable onPress={() => openAction(item.action)} accessibilityRole="button"><Text style={[styles.actionLink, { color: colors.primary }]}>{actionLabel(item.action)} ›</Text></Pressable> : null}</View>}
        ListFooterComponent={<View style={styles.composer}><TextInput value={draft} onChangeText={setDraft} editable={!isBusy} multiline placeholder="Type a Nursing study question or review your spoken transcript" placeholderTextColor={colors.muted} style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.foreground }, isBusy && styles.dimmed]} accessibilityLabel="Voice tutor study question or transcript" /><View style={styles.controls}>{phase === "listening" ? <Pressable onPress={() => void stopAndTranscribe()} accessibilityRole="button" style={[styles.recordButton, { backgroundColor: colors.error }]}><Text style={[styles.recordButtonText, { color: colors.background }]}>Stop & review</Text></Pressable> : <Pressable onPress={() => void beginRecording()} disabled={isBusy} accessibilityRole="button" style={[styles.recordButton, { borderColor: colors.primary }, isBusy && styles.dimmed]}><Text style={[styles.recordButtonText, { color: colors.primary }]}>Speak to Rounds</Text></Pressable>}<Pressable onPress={() => void sendToTutor()} disabled={isBusy || !draft.trim()} accessibilityRole="button" style={[styles.sendButton, { backgroundColor: colors.primary }, (isBusy || !draft.trim()) && styles.dimmed]}>{phase === "transcribing" || phase === "thinking" ? <ActivityIndicator color={colors.background} /> : <Text style={[styles.sendButtonText, { color: colors.background }]}>Send</Text>}</Pressable></View>{turns.length ? <Pressable onPress={clearConversation} accessibilityRole="button"><Text style={[styles.clear, { color: colors.muted }]}>Clear this private conversation</Text></Pressable> : null}<Text style={[styles.footnote, { color: colors.muted }]}>Voice Tutor needs a connection for transcription and replies. Your conversation is not saved to Community, owner tools, or your account. Rounds uses the English voice chosen in Settings. On iPhone, turn off Silent Mode to hear speech.</Text></View>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 18, paddingBottom: 38, gap: 12 }, back: { fontSize: 14, fontWeight: "800", marginBottom: 3 }, header: { gap: 6, marginBottom: 4 }, eyebrow: { fontSize: 11, letterSpacing: 1.7, fontWeight: "900" }, title: { fontFamily: "Georgia", fontSize: 30, lineHeight: 38, fontWeight: "700" }, sub: { fontSize: 14, lineHeight: 21 }, statusCard: { borderWidth: 1, borderRadius: 19, padding: 14, gap: 6, marginTop: 11 }, statusLabel: { fontSize: 10, letterSpacing: 1.2, fontWeight: "900" }, statusCopy: { fontSize: 13, lineHeight: 19 }, stopVoice: { minHeight: 38, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center", marginTop: 2 }, stopVoiceText: { fontSize: 12, fontWeight: "900" }, welcomeCard: { borderWidth: 1, borderRadius: 19, padding: 15, gap: 5, marginTop: 2 }, welcomeTitle: { fontSize: 15, fontWeight: "900" }, welcomeText: { fontSize: 13, lineHeight: 19 }, bubble: { borderWidth: 1, borderRadius: 18, padding: 14, gap: 6, maxWidth: "92%" }, userBubble: { alignSelf: "flex-end", borderColor: "transparent" }, tutorBubble: { alignSelf: "flex-start" }, bubbleLabel: { fontSize: 10, letterSpacing: 1.2, fontWeight: "900" }, bubbleText: { fontSize: 14, lineHeight: 21 }, actionLink: { fontSize: 12, fontWeight: "900", marginTop: 2 }, composer: { gap: 9, marginTop: 5 }, input: { minHeight: 100, borderWidth: 1, borderRadius: 17, padding: 14, fontSize: 15, textAlignVertical: "top" }, controls: { flexDirection: "row", gap: 8 }, recordButton: { flex: 1, minHeight: 50, borderRadius: 15, borderWidth: 1, alignItems: "center", justifyContent: "center" }, recordButtonText: { fontSize: 13, fontWeight: "900" }, sendButton: { width: 92, minHeight: 50, borderRadius: 15, alignItems: "center", justifyContent: "center" }, sendButtonText: { fontSize: 14, fontWeight: "900" }, clear: { fontSize: 12, textAlign: "center", fontWeight: "800", marginTop: 3 }, footnote: { fontSize: 11, lineHeight: 16, textAlign: "center", paddingHorizontal: 5 }, dimmed: { opacity: 0.45 },
});

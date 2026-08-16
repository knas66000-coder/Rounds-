import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import * as Speech from "expo-speech";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from "expo-audio";
import { useFocusEffect } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { categories, questionBank, type Category } from "@/data/questionBank";
import { evaluateAnswer, shuffle, type Evaluation, type Verdict } from "@/lib/rounds";
import { useColors } from "@/hooks/use-colors";
import { encodeRecordedAudio } from "@/lib/audio-encoding";
import { trpc } from "@/lib/trpc";
import { ACTIVE_CATEGORY_KEY, nextStepForVerdict, questionsForCategory } from "@/lib/session";
import { haptic } from "@/lib/haptics";

const STORAGE_KEY = "rounds.session.v1";

type Phase = "idle" | "asking" | "listening" | "transcribing" | "result";
type SavedResult = { verdict: Verdict; category: Category; at: string };

export default function HomeScreen() {
  const colors = useColors();
  const [category, setCategory] = useState<Category | "All">("All");
  const [queue, setQueue] = useState(() => shuffle(questionBank));
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [transcript, setTranscript] = useState("");
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [autoMode, setAutoMode] = useState(false);
  const [results, setResults] = useState<SavedResult[]>([]);
  const [answerDraft, setAnswerDraft] = useState("");
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const recorderRef = useRef(recorder);
  const isRecordingRef = useRef(false);
  const transcribeMutation = trpc.voice.transcribe.useMutation();
  const question = queue[index % queue.length];
  const answered = results.length;
  const correct = results.filter((item) => item.verdict === "correct").length;
  const accuracy = answered ? Math.round((correct / answered) * 100) : 0;

  useEffect(() => {
    recorderRef.current = recorder;
  }, [recorder]);

  useEffect(() => {
    isRecordingRef.current = recorderState.isRecording;
  }, [recorderState.isRecording]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (value) setResults(JSON.parse(value) as SavedResult[]);
    });
    return () => {
      Speech.stop();
      if (autoTimer.current) clearTimeout(autoTimer.current);
      if (recordingTimer.current) clearTimeout(recordingTimer.current);
      if (isRecordingRef.current) void recorderRef.current.stop();
    };
  }, []);

  const saveResult = async (verdict: Verdict) => {
    const next = [...results, { verdict, category: question.cat, at: new Date().toISOString() }];
    setResults(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const askQuestion = () => {
    haptic.light();
    Speech.stop();
    setEvaluation(null);
    setTranscript("");
    setAnswerDraft("");
    setVoiceNotice(null);
    setPhase("asking");
    Speech.speak(question.q, {
      rate: 0.98,
      pitch: 1,
      language: "en-US",
      onDone: () => void startListening(),
      onError: () => void startListening(),
    });
  };

  const startListening = async () => {
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        haptic.error();
        setPhase("idle");
        setVoiceNotice("Microphone access is off. You can type an answer below instead.");
        Alert.alert("Microphone permission needed", "Allow microphone access in your device settings to answer hands-free. You can still type your response.");
        return;
      }
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setPhase("listening");
      setVoiceNotice("Recording your answer. Tap Stop & grade when you finish, or wait up to 8 seconds.");
      if (recordingTimer.current) clearTimeout(recordingTimer.current);
      recordingTimer.current = setTimeout(() => void stopListeningAndTranscribe(), 8000);
    } catch {
      haptic.error();
      setPhase("idle");
      setVoiceNotice("The microphone could not start. You can type your answer instead.");
    }
  };

  const stopListeningAndTranscribe = async () => {
    if (recordingTimer.current) clearTimeout(recordingTimer.current);
    try {
      haptic.medium();
      setPhase("transcribing");
      setVoiceNotice("Transcribing your spoken answer…");
      const originalUri = recorder.uri;
      await recorder.stop();
      const recordingUri = recorder.uri ?? originalUri;
      if (!recordingUri) throw new Error("No recording was available.");
      const payload = await encodeRecordedAudio(recordingUri);
      const response = await transcribeMutation.mutateAsync(payload);
      if (!response.text) throw new Error("No speech was recognized.");
      setAnswerDraft(response.text);
      setVoiceNotice(null);
      await submitAnswer(response.text);
    } catch {
      haptic.error();
      setPhase("idle");
      setVoiceNotice("We could not transcribe that response. Try recording again or type your answer.");
    }
  };

  const submitTypedAnswer = async () => {
    if (recordingTimer.current) clearTimeout(recordingTimer.current);
    if (recorderState.isRecording) await recorder.stop();
    await submitAnswer(answerDraft);
  };

  const submitAnswer = async (value: string) => {
    const clean = value.trim();
    if (!clean) {
      Alert.alert("Add an answer", "Speak your answer or type a response before submitting.");
      return;
    }
    Speech.stop();
    const nextEvaluation = evaluateAnswer(clean, question);
    if (nextEvaluation.verdict === "correct") haptic.success();
    else if (nextEvaluation.verdict === "partial") haptic.warning();
    else haptic.error();
    setTranscript(clean);
    setEvaluation(nextEvaluation);
    setVoiceNotice(null);
    setPhase("result");
    await saveResult(nextEvaluation.verdict);
    Speech.speak(nextEvaluation.feedback, { rate: 0.98, language: "en-US" });
    if (autoMode) {
      autoTimer.current = setTimeout(() => nextQuestion(), 4500);
    }
  };

  const nextQuestion = () => {
    haptic.light();
    if (autoTimer.current) clearTimeout(autoTimer.current);
    setIndex((value) => (value + 1) % Math.max(queue.length, 1));
    setEvaluation(null);
    setTranscript("");
    setAnswerDraft("");
    setVoiceNotice(null);
    setPhase("idle");
  };

  const changeCategory = (value: Category | "All", persist = true) => {
    Speech.stop();
    setCategory(value);
    const nextQueue = shuffle(questionsForCategory(value));
    setQueue(nextQueue.length ? nextQueue : questionBank);
    setIndex(0);
    setEvaluation(null);
    setVoiceNotice(null);
    setPhase("idle");
    if (persist) void AsyncStorage.setItem(ACTIVE_CATEGORY_KEY, value);
  };

  useFocusEffect(useCallback(() => {
    let mounted = true;
    AsyncStorage.getItem(ACTIVE_CATEGORY_KEY).then((storedCategory) => {
      const isValidCategory = storedCategory === "All" || categories.some((item) => item.name === storedCategory);
      if (mounted && isValidCategory && storedCategory !== category) changeCategory(storedCategory as Category | "All", false);
    });
    return () => { mounted = false; };
  }, [category]));

  const toggleAutoMode = () => {
    const nextMode = !autoMode;
    haptic.medium();
    setAutoMode(nextMode);
    if (!nextMode) {
      Speech.stop();
      if (autoTimer.current) clearTimeout(autoTimer.current);
      return;
    }
    if (phase === "idle" && !evaluation) askQuestion();
  };

  const resetSession = () => {
    Alert.alert("Reset this session?", "This clears the current score and starts a fresh question order. Your saved study history will remain in Progress.", [
      { text: "Cancel", style: "cancel" },
      { text: "Reset", style: "destructive", onPress: () => {
        haptic.medium();
        Speech.stop();
        if (autoTimer.current) clearTimeout(autoTimer.current);
        if (recordingTimer.current) clearTimeout(recordingTimer.current);
        setResults([]);
        setQueue(shuffle(questionsForCategory(category)));
        setIndex(0);
        setEvaluation(null);
        setTranscript("");
        setAnswerDraft("");
        setVoiceNotice(null);
        setPhase("idle");
      } },
    ]);
  };

  const phaseLabel = phase === "asking" ? "Speaking question" : phase === "listening" ? "Listening for your answer" : phase === "transcribing" ? "Transcribing your answer" : phase === "result" ? "Answer reviewed" : "Ready when you are";
  const verdictColor = evaluation?.verdict === "correct" ? colors.success : evaluation?.verdict === "partial" ? colors.warning : colors.error;

  return (
    <ScreenContainer className="px-5" edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>ROUNDS NCLEX</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>Practice out loud.</Text>
          </View>
          <View style={[styles.scorePill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.scoreNumber, { color: colors.primary }]}>{accuracy}%</Text>
            <Text style={[styles.scoreLabel, { color: colors.muted }]}>accuracy</Text>
          </View>
        </View>

        <View style={styles.filterRow}>
          <Text style={[styles.sectionLabel, { color: colors.muted }]}>TOPIC</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            <Pressable onPress={() => { haptic.light(); changeCategory("All"); }} accessibilityRole="button" accessibilityState={{ selected: category === "All" }} accessibilityLabel="Practice all NCLEX topics" style={[styles.chip, { borderColor: category === "All" ? colors.primary : colors.border, backgroundColor: category === "All" ? colors.primary : colors.surface }]}>
              <Text style={{ color: category === "All" ? colors.background : colors.foreground, fontWeight: "700" }}>All topics</Text>
            </Pressable>
            {categories.slice(0, 6).map((item) => (
              <Pressable key={item.name} onPress={() => { haptic.light(); changeCategory(item.name); }} accessibilityRole="button" accessibilityState={{ selected: category === item.name }} accessibilityLabel={`Practice ${item.name} questions`} style={[styles.chip, { borderColor: category === item.name ? colors.primary : colors.border, backgroundColor: category === item.name ? colors.primary : colors.surface }]}>
                <Text style={{ color: category === item.name ? colors.background : colors.foreground, fontWeight: "700" }}>{item.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={[styles.questionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardMeta}>
            <Text style={[styles.category, { color: colors.primary }]}>{category === "All" ? question.cat.toUpperCase() : `${category} FOCUS`.toUpperCase()}</Text>
            <Text style={[styles.progress, { color: colors.muted }]}>QUESTION {index + 1}</Text>
          </View>
          <Text style={[styles.question, { color: colors.foreground }]}>{question.q}</Text>
          <Text style={[styles.phase, { color: phase === "listening" ? colors.primary : colors.muted }]}>{phaseLabel}</Text>
        </View>

        {evaluation ? (
          <View style={[styles.reviewCard, { borderColor: verdictColor, backgroundColor: colors.surface }]}>
            <View style={styles.reviewHeader}>
              <Text style={[styles.verdict, { color: verdictColor }]}>{evaluation.verdict.toUpperCase()}</Text>
              <Text style={[styles.match, { color: colors.muted }]}>{evaluation.matched.length}/{question.keys.length} key points</Text>
            </View>
            <Text style={[styles.transcriptLabel, { color: colors.muted }]}>YOUR RESPONSE</Text>
            <Text style={[styles.transcript, { color: colors.foreground }]}>{transcript}</Text>
            <Text style={[styles.contextTitle, { color: colors.foreground }]}>Clinical context</Text>
            <Text style={[styles.body, { color: colors.muted }]}>{question.explanation}</Text>
            <Text style={[styles.contextTitle, { color: colors.foreground }]}>Why it matters</Text>
            <Text style={[styles.body, { color: colors.muted }]}>{question.clinicalSignificance}</Text>
            <Text style={[styles.contextTitle, { color: colors.foreground }]}>Keyword check</Text>
            <View style={styles.keyList}>
              {question.keys.map((key) => {
                const recognized = evaluation.matched.includes(key);
                return <View key={key} style={[styles.keyPill, { backgroundColor: recognized ? colors.success : colors.background, borderColor: recognized ? colors.success : colors.border }]}><Text style={{ color: recognized ? colors.background : colors.muted, fontWeight: "800" }}>{recognized ? "✓" : "○"}</Text><Text style={{ color: recognized ? colors.background : colors.foreground, fontWeight: "700" }}>{key}</Text></View>;
              })}
            </View>
            <View style={[styles.nextStepBox, { backgroundColor: colors.background }]}><Text style={[styles.transcriptLabel, { color: colors.primary }]}>NEXT STEP</Text><Text style={[styles.bodyStrong, { color: colors.foreground }]}>{nextStepForVerdict(evaluation.verdict)}</Text></View>
            <View style={[styles.answerBox, { backgroundColor: colors.background }]}> 
              <Text style={[styles.transcriptLabel, { color: colors.primary }]}>KEY ANSWER</Text>
              <Text style={[styles.bodyStrong, { color: colors.foreground }]}>{question.a}</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.actionArea}>
          {phase === "listening" ? (
            <Pressable onPress={() => void stopListeningAndTranscribe()} style={({ pressed }) => [styles.micButton, { backgroundColor: colors.error }, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel="Stop microphone recording and grade answer" accessibilityHint="Stops recording and submits the transcribed response for grading">
              <Text style={styles.micIcon}>■</Text>
              <Text style={styles.micText}>Stop & grade</Text>
            </Pressable>
          ) : phase === "asking" || phase === "transcribing" ? (
            <View style={[styles.micButton, { backgroundColor: colors.primary, opacity: 0.78 }]} accessibilityLabel={phase === "asking" ? "Question is being spoken" : "Spoken answer is being transcribed"}>
              <Text style={styles.micIcon}>…</Text>
              <Text style={styles.micText}>{phase === "asking" ? "Speaking…" : "Transcribing…"}</Text>
            </View>
          ) : evaluation ? (
            <Pressable onPress={nextQuestion} style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.primary }, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel="Next question">
              <Text style={[styles.primaryButtonText, { color: colors.background }]}>Next question</Text>
            </Pressable>
          ) : (
            <Pressable onPress={askQuestion} style={({ pressed }) => [styles.micButton, { backgroundColor: colors.primary }, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel="Ask the current question aloud" accessibilityHint="The app will read the question and start recording your response">
              <Text style={styles.micIcon}>◉</Text>
              <Text style={styles.micText}>Ask me</Text>
            </Pressable>
          )}
          {(phase === "listening" || phase === "asking" || phase === "transcribing" || voiceNotice) && (
            <View style={styles.fallbackArea}>
              {voiceNotice ? <Text style={[styles.voiceNotice, { color: colors.muted }]}>{voiceNotice}</Text> : null}
              <TextInput value={answerDraft} onChangeText={setAnswerDraft} placeholder="Type your answer if you prefer" placeholderTextColor={colors.muted} style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.surface }]} multiline editable={phase !== "transcribing"} />
              {phase !== "transcribing" ? <Pressable onPress={() => void submitTypedAnswer()} style={({ pressed }) => [styles.textSubmit, { borderColor: colors.primary }, pressed && styles.pressed]}><Text style={[styles.textSubmitLabel, { color: colors.primary }]}>Submit typed answer</Text></Pressable> : null}
            </View>
          )}
          <View style={styles.modeRow}>
            <Text style={[styles.modeLabel, { color: colors.muted }]}>Practice mode</Text>
            <Pressable onPress={toggleAutoMode} accessibilityRole="switch" accessibilityState={{ checked: autoMode }} accessibilityLabel="Auto practice mode" accessibilityHint="When on, the next question begins automatically after feedback" style={[styles.modeToggle, { backgroundColor: autoMode ? colors.primary : colors.border }]}>
              <View style={[styles.toggleKnob, autoMode && styles.toggleKnobOn]} />
              <Text style={[styles.modeText, { color: autoMode ? colors.background : colors.foreground }]}>{autoMode ? "AUTO" : "MANUAL"}</Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.statsCard, { borderColor: colors.border }]}>
          <Text style={[styles.sectionLabel, { color: colors.muted }]}>SESSION SNAPSHOT</Text>
          <View style={styles.statsRow}>
            <Stat label="Answered" value={String(answered)} color={colors.foreground} />
            <Stat label="Correct" value={String(correct)} color={colors.success} />
            <Stat label="Partial" value={String(results.filter((item) => item.verdict === "partial").length)} color={colors.warning} />
            <Stat label="Missed" value={String(results.filter((item) => item.verdict === "incorrect").length)} color={colors.error} />
          </View>
          <Pressable onPress={resetSession} accessibilityRole="button" accessibilityLabel="Reset current session" style={({ pressed }) => [styles.resetButton, { borderColor: colors.border }, pressed && styles.pressed]}><Text style={[styles.resetText, { color: colors.muted }]}>Reset current session</Text></Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return <View><Text style={[styles.statValue, { color }]}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  content: { paddingTop: 18, paddingBottom: 40, gap: 18 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  eyebrow: { fontSize: 12, letterSpacing: 2.4, fontWeight: "800" },
  title: { fontFamily: "Georgia", fontSize: 30, lineHeight: 38, fontWeight: "700", marginTop: 4 },
  scorePill: { borderWidth: 1, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 9, alignItems: "center" },
  scoreNumber: { fontSize: 20, fontWeight: "800" }, scoreLabel: { fontSize: 10, marginTop: 1 },
  filterRow: { gap: 8 }, sectionLabel: { fontSize: 11, letterSpacing: 1.4, fontWeight: "800" }, chips: { gap: 8 },
  chip: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999 },
  questionCard: { borderWidth: 1, borderRadius: 24, padding: 22, gap: 18 }, cardMeta: { flexDirection: "row", justifyContent: "space-between" }, category: { fontSize: 11, fontWeight: "800", letterSpacing: 1.2 }, progress: { fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  question: { fontFamily: "Georgia", fontSize: 25, lineHeight: 34, fontWeight: "700" }, phase: { fontSize: 13, fontWeight: "600" },
  actionArea: { gap: 12, alignItems: "stretch" }, micButton: { minHeight: 66, borderRadius: 22, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 10 }, micIcon: { color: "#F5F1E8", fontSize: 22 }, micText: { color: "#F5F1E8", fontSize: 17, fontWeight: "800" }, primaryButton: { minHeight: 58, borderRadius: 18, alignItems: "center", justifyContent: "center" }, primaryButtonText: { fontSize: 16, fontWeight: "800" }, pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
  fallbackArea: { gap: 8 }, voiceNotice: { fontSize: 12, lineHeight: 17, paddingHorizontal: 2 }, input: { minHeight: 74, borderWidth: 1, borderRadius: 16, padding: 14, fontSize: 15, textAlignVertical: "top" }, textSubmit: { minHeight: 42, borderWidth: 1, borderRadius: 14, justifyContent: "center", alignItems: "center" }, textSubmitLabel: { fontSize: 13, fontWeight: "800" }, modeRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, modeLabel: { fontSize: 13, fontWeight: "600" }, modeToggle: { borderRadius: 999, padding: 5, paddingRight: 12, flexDirection: "row", alignItems: "center", gap: 7 }, toggleKnob: { width: 20, height: 20, borderRadius: 10, backgroundColor: "#F5F1E8" }, toggleKnobOn: { backgroundColor: "#F5F1E8" }, modeText: { fontSize: 10, fontWeight: "900", letterSpacing: 0.8 },
  reviewCard: { borderWidth: 1.5, borderRadius: 22, padding: 18, gap: 10 }, reviewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, verdict: { fontSize: 13, fontWeight: "900", letterSpacing: 1.2 }, match: { fontSize: 12, fontWeight: "700" }, transcriptLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1.2, marginTop: 4 }, transcript: { fontSize: 15, lineHeight: 22 }, contextTitle: { fontSize: 15, fontWeight: "800", marginTop: 4 }, body: { fontSize: 14, lineHeight: 21 }, keyList: { flexDirection: "row", flexWrap: "wrap", gap: 7 }, keyPill: { flexDirection: "row", gap: 6, alignItems: "center", borderWidth: 1, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999 }, nextStepBox: { padding: 12, borderRadius: 14, gap: 4, marginTop: 3 }, answerBox: { padding: 12, borderRadius: 14, gap: 4, marginTop: 3 }, bodyStrong: { fontSize: 14, lineHeight: 20, fontWeight: "700" },
  statsCard: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 14 }, statsRow: { flexDirection: "row", justifyContent: "space-between" }, statValue: { fontSize: 22, fontWeight: "800" }, statLabel: { fontSize: 11, color: "#687076", marginTop: 2 }, resetButton: { minHeight: 38, borderTopWidth: 1, justifyContent: "center", alignItems: "center", marginTop: 2 }, resetText: { fontSize: 12, fontWeight: "800" },
});

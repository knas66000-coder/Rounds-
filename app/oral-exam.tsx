import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import * as Speech from "expo-speech";
import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from "expo-audio";

import { ScreenContainer } from "@/components/screen-container";
import { categories, questionBank, type Category, type Question } from "@/data/questionBank";
import { useColors } from "@/hooks/use-colors";
import { encodeRecordedAudio } from "@/lib/audio-encoding";
import { haptic } from "@/lib/haptics";
import { buildOralExamQueue, matchOralExamTopic, oralExamFollowUpPrompt, selectOralExamFollowUp } from "@/lib/oral-exam";
import { evaluateAnswer, type Evaluation } from "@/lib/rounds";
import { recordLearningOutcome } from "@/lib/adaptive-store";
import { defaultVoicePreferences, parseVoicePreferences, prepareFeedbackSpeech, prepareQuestionSpeech, prepareRationaleSpeech, VOICE_PREFERENCES_KEY } from "@/lib/voice";
import { trpc } from "@/lib/trpc";

type OralPhase = "setup" | "speaking" | "listening" | "transcribing" | "review" | "complete";
type RecordingPurpose = "topic" | "answer";
type GroundedReference = { supported: boolean; title: string; excerpt: string; explanation: string };

export default function OralExamScreen() {
  const colors = useColors();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<Category>(categories[0].name);
  const [queue, setQueue] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<OralPhase>("setup");
  const [recordingPurpose, setRecordingPurpose] = useState<RecordingPurpose>("answer");
  const [answerDraft, setAnswerDraft] = useState("");
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [followUp, setFollowUp] = useState(false);
  const [speechRate, setSpeechRate] = useState(defaultVoicePreferences.rate);
  const [spokenRationale, setSpokenRationale] = useState(defaultVoicePreferences.spokenRationale);
  const [notice, setNotice] = useState("Choose a topic, then begin a focused oral-practice round.");
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null);
  const [groundedReference, setGroundedReference] = useState<GroundedReference | null>(null);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const recorderRef = useRef(recorder);
  const recordingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transcribeMutation = trpc.voice.transcribe.useMutation();
  const materialsQuery = trpc.studyMaterials.list.useQuery();
  const groundingMutation = trpc.studyMaterials.groundOralFeedback.useMutation();
  const question = queue[index];
  const recordingSeconds = Math.min(8, Math.max(0, Math.ceil((recorderState.durationMillis ?? 0) / 1000)));

  useEffect(() => {
    recorderRef.current = recorder;
  }, [recorder]);

  useEffect(() => {
    AsyncStorage.getItem(VOICE_PREFERENCES_KEY).then((value) => {
      const preferences = parseVoicePreferences(value);
      setSpeechRate(preferences.rate);
      setSpokenRationale(preferences.spokenRationale);
    });
    return () => {
      Speech.stop();
      if (recordingTimer.current) clearTimeout(recordingTimer.current);
      if (recorderRef.current.isRecording) void recorderRef.current.stop();
    };
  }, []);

  useEffect(() => {
    const materials = materialsQuery.data ?? [];
    if (selectedMaterialId !== null && materials.some((material) => material.id === selectedMaterialId)) return;
    setSelectedMaterialId(materials[0]?.id ?? null);
  }, [materialsQuery.data, selectedMaterialId]);

  const startRound = (topic = selectedCategory) => {
    Speech.stop();
    const nextQueue = buildOralExamQueue(questionBank, topic, 10);
    if (!nextQueue.length) {
      setNotice("This topic is not available in the installed Nursing pack yet.");
      return;
    }
    haptic.medium();
    setSelectedCategory(topic);
    setQueue(nextQueue);
    setIndex(0);
    setAnswerDraft("");
    setEvaluation(null);
    setFollowUp(false);
    setGroundedReference(null);
    setNotice(`${topic} oral exam is ready. Hear the first question when you are ready.`);
    setPhase("setup");
  };

  const speakQuestion = () => {
    if (!question) return;
    haptic.light();
    Speech.stop();
    setPhase("speaking");
    setNotice("Reading the question. Recording will begin after the prompt.");
    Speech.speak(prepareQuestionSpeech(question.q), {
      rate: speechRate,
      language: "en-US",
      onDone: () => void beginRecording("answer"),
      onError: () => { setPhase("setup"); setNotice("Speech could not start. You can record or type an answer."); },
    });
  };

  const beginRecording = async (purpose: RecordingPurpose) => {
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        setPhase("setup");
        setNotice(purpose === "topic" ? "Microphone access is off. Select a topic below instead." : "Microphone access is off. Type your answer below instead.");
        return;
      }
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      await recorder.prepareToRecordAsync();
      setRecordingPurpose(purpose);
      recorder.record();
      setPhase("listening");
      setNotice(purpose === "topic" ? "Listening for a Nursing topic. For example, say cardiac or pharmacology." : "Listening for your answer. Stop when you finish speaking.");
      if (recordingTimer.current) clearTimeout(recordingTimer.current);
      recordingTimer.current = setTimeout(() => void stopAndTranscribe(), 8000);
    } catch {
      setPhase("setup");
      setNotice("The microphone could not start. Use the visible typed option instead.");
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
      if (recordingPurpose === "topic") {
        const match = matchOralExamTopic(transcript, categories.map((item) => item.name));
        if (!match) {
          setPhase("setup");
          setNotice(`We heard “${transcript}” but could not match it to a Nursing topic. Select a topic below instead.`);
          return;
        }
        setSelectedCategory(match);
        setPhase("setup");
        setNotice(`${match} selected. Start your focused oral exam when ready.`);
        return;
      }
      setAnswerDraft(transcript);
      setPhase("setup");
      setNotice("Transcript ready. Review it, then submit for feedback.");
    } catch {
      setPhase("setup");
      setNotice(recordingPurpose === "topic" ? "We could not recognise that topic. Select one below instead." : "We could not transcribe that answer. Try again or type your response.");
    }
  };

  const submitAnswer = async () => {
    if (!question) return;
    const response = answerDraft.trim();
    if (!response) {
      Alert.alert("Add an answer", "Speak or type your clinical response before submitting.");
      return;
    }
    Speech.stop();
    const nextEvaluation = evaluateAnswer(response, question);
    setEvaluation(nextEvaluation);
    setPhase("review");
    await recordLearningOutcome(question.id, nextEvaluation.verdict);
    setGroundedReference(null);

    if (selectedMaterialId) void groundingMutation.mutateAsync({ materialId: selectedMaterialId, question: question.q, learnerAnswer: response }).then(setGroundedReference).catch(() => setGroundedReference(null));

    const suggestedFollowUp = nextEvaluation.verdict === "correct" ? null : selectOralExamFollowUp(question, nextEvaluation.matched, queue.slice(index + 1));
    setFollowUp(Boolean(suggestedFollowUp));
    if (suggestedFollowUp) {
      setQueue((current) => [...current.slice(0, index + 1), suggestedFollowUp, ...current.slice(index + 1).filter((item) => item.id !== suggestedFollowUp.id)]);
    }
    setNotice(suggestedFollowUp ? oralExamFollowUpPrompt(nextEvaluation.matched, question) : "Review the explanation, then continue when ready.");
    Speech.speak(prepareFeedbackSpeech(nextEvaluation.feedback), {
      rate: speechRate,
      language: "en-US",
      onDone: () => {
        if (spokenRationale) Speech.speak(prepareRationaleSpeech(question.explanation, question.clinicalSignificance), { rate: speechRate, language: "en-US" });
      },
    });
  };

  const nextQuestion = () => {
    Speech.stop();
    haptic.light();
    if (index + 1 >= queue.length) {
      setPhase("complete");
      setNotice(`You completed this ${selectedCategory} oral-practice round without repeating a question.`);
      return;
    }
    setIndex((current) => current + 1);
    setAnswerDraft("");
    setEvaluation(null);
    setFollowUp(false);
    setGroundedReference(null);
    setPhase("setup");
    setNotice("Next question ready. Hear it aloud or answer when ready.");
  };

  const replayRationale = () => {
    if (!question) return;
    Speech.stop();
    Speech.speak(prepareRationaleSpeech(question.explanation, question.clinicalSignificance), { rate: speechRate, language: "en-US" });
  };

  const hasRound = queue.length > 0 && phase !== "complete";

  return (
    <ScreenContainer className="px-5" edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => { Speech.stop(); router.back(); }} accessibilityRole="button"><Text style={[styles.back, { color: colors.primary }]}>‹ Study tools</Text></Pressable>
        <View style={styles.header}><Text style={[styles.eyebrow, { color: colors.primary }]}>VOICE-FIRST ORAL EXAM</Text><Text style={[styles.title, { color: colors.foreground }]}>Practise like an oral exam.</Text><Text style={[styles.sub, { color: colors.muted }]}>Choose a Nursing topic, answer aloud, and receive focused follow-up questions without repeating a prompt.</Text></View>

        <View style={[styles.topicCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionLabel, { color: colors.primary }]}>CHOOSE A TOPIC</Text>
          <View style={styles.chips}>{categories.map(({ name }) => <Pressable key={name} onPress={() => { Speech.stop(); startRound(name); }} accessibilityRole="button" accessibilityState={{ selected: selectedCategory === name }} style={[styles.chip, { borderColor: selectedCategory === name ? colors.primary : colors.border, backgroundColor: selectedCategory === name ? colors.primary : colors.background }]}><Text style={{ color: selectedCategory === name ? colors.background : colors.foreground, fontWeight: "800", fontSize: 12 }}>{name}</Text></Pressable>)}</View>
          <Pressable onPress={() => void beginRecording("topic")} style={({ pressed }) => [styles.voiceTopicButton, { borderColor: colors.primary }, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel="Say a Nursing topic to select it"><Text style={[styles.voiceTopicText, { color: colors.primary }]}>◉ Say a topic</Text></Pressable>
          <Pressable onPress={() => startRound()} style={({ pressed }) => [styles.startButton, { backgroundColor: colors.primary }, pressed && styles.pressed]} accessibilityRole="button"><Text style={[styles.startText, { color: colors.background }]}>Start {selectedCategory} oral exam</Text></Pressable>
          <View style={[styles.materialPicker, { borderTopColor: colors.border }]}><View style={styles.materialPickerCopy}><Text style={[styles.materialPickerTitle, { color: colors.foreground }]}>Study material reference</Text><Text style={[styles.materialPickerText, { color: colors.muted }]}>{materialsQuery.data?.length ? "Optional: choose a private PDF for a clearly labelled source excerpt after review, or open it in the private Reader." : "No private PDF added yet. Official Rounds rationales remain available."}</Text></View>{materialsQuery.data?.length ? <View style={styles.materialChips}>{materialsQuery.data.map((material) => <Pressable key={material.id} onPress={() => setSelectedMaterialId(material.id)} accessibilityRole="button" accessibilityState={{ selected: selectedMaterialId === material.id }} style={[styles.materialChip, { borderColor: selectedMaterialId === material.id ? colors.primary : colors.border, backgroundColor: selectedMaterialId === material.id ? colors.primary : colors.background }]}><Text numberOfLines={1} style={[styles.materialChipText, { color: selectedMaterialId === material.id ? colors.background : colors.foreground }]}>{material.title}</Text></Pressable>)}</View> : null}{selectedMaterialId ? <Pressable onPress={() => router.push(`/pdf-reader?materialId=${selectedMaterialId}` as never)} accessibilityRole="button"><Text style={[styles.materialManage, { color: colors.primary }]}>Read selected PDF ›</Text></Pressable> : null}<Pressable onPress={() => router.push("/study-materials")} accessibilityRole="button"><Text style={[styles.materialManage, { color: colors.primary }]}>Manage private materials ›</Text></Pressable></View>
        </View>

        {hasRound && question ? <View style={[styles.questionCard, { borderColor: colors.primary, backgroundColor: colors.surface }]}><View style={styles.meta}><Text style={[styles.sectionLabel, { color: colors.primary }]}>{selectedCategory.toUpperCase()}</Text><Text style={[styles.progress, { color: colors.muted }]}>QUESTION {index + 1} OF {queue.length}</Text></View><Text style={[styles.question, { color: colors.foreground }]}>{question.q}</Text><Text style={[styles.notice, { color: colors.muted }]}>{notice}</Text></View> : null}

        {phase === "listening" ? <View style={[styles.recordingCard, { borderColor: colors.error, backgroundColor: colors.surface }]}><Text style={[styles.recordingLabel, { color: colors.error }]}>LISTENING · {recordingSeconds}s / 8s</Text><Pressable onPress={() => void stopAndTranscribe()} style={[styles.stopButton, { backgroundColor: colors.error }]} accessibilityRole="button"><Text style={[styles.stopText, { color: colors.background }]}>Stop and review transcript</Text></Pressable></View> : null}
        {phase === "speaking" ? <Pressable onPress={() => void Speech.stop()} style={[styles.stopButton, { backgroundColor: colors.primary }]} accessibilityRole="button"><Text style={[styles.stopText, { color: colors.background }]}>Stop speaking</Text></Pressable> : null}

        {hasRound && phase !== "listening" && phase !== "transcribing" && phase !== "speaking" && !evaluation ? <View style={styles.actionArea}><Pressable onPress={speakQuestion} style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.primary }, pressed && styles.pressed]} accessibilityRole="button"><Text style={[styles.primaryText, { color: colors.background }]}>Ask me aloud</Text></Pressable><TextInput value={answerDraft} onChangeText={setAnswerDraft} multiline placeholder="Type your response, or say it after Ask me aloud" placeholderTextColor={colors.muted} style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.foreground }]} accessibilityLabel="Oral exam answer transcript or typed response" /><View style={styles.actionRow}><Pressable onPress={() => void beginRecording("answer")} style={[styles.secondaryButton, { borderColor: colors.primary }]} accessibilityRole="button"><Text style={[styles.secondaryText, { color: colors.primary }]}>Record answer</Text></Pressable><Pressable onPress={() => void submitAnswer()} style={[styles.secondaryButton, { borderColor: colors.border }]} accessibilityRole="button"><Text style={[styles.secondaryText, { color: colors.foreground }]}>Submit & review</Text></Pressable></View></View> : null}

        {evaluation && question ? <View style={[styles.reviewCard, { borderColor: evaluation.verdict === "correct" ? colors.success : evaluation.verdict === "partial" ? colors.warning : colors.error, backgroundColor: colors.surface }]}><Text style={[styles.verdict, { color: evaluation.verdict === "correct" ? colors.success : evaluation.verdict === "partial" ? colors.warning : colors.error }]}>{evaluation.verdict.toUpperCase()}</Text><Text style={[styles.reviewCopy, { color: colors.foreground }]}>{evaluation.feedback}</Text><Text style={[styles.contextTitle, { color: colors.foreground }]}>Clinical rationale</Text><Text style={[styles.body, { color: colors.muted }]}>{question.explanation}</Text><Text style={[styles.contextTitle, { color: colors.foreground }]}>Why it matters</Text><Text style={[styles.body, { color: colors.muted }]}>{question.clinicalSignificance}</Text>{groundingMutation.isPending ? <Text style={[styles.sourceStatus, { color: colors.muted }]}>Checking your selected study material for direct support…</Text> : null}{groundedReference?.supported ? <View style={[styles.sourceCard, { borderColor: colors.border, backgroundColor: colors.background }]}><Text style={[styles.sourceLabel, { color: colors.primary }]}>YOUR STUDY MATERIAL · {groundedReference.title.toUpperCase()}</Text><Text style={[styles.sourceQuote, { color: colors.foreground }]}>“{groundedReference.excerpt}”</Text>{groundedReference.explanation ? <Text style={[styles.sourceExplanation, { color: colors.muted }]}>{groundedReference.explanation}</Text> : null}</View> : selectedMaterialId && !groundingMutation.isPending ? <Text style={[styles.sourceStatus, { color: colors.muted }]}>Your selected study material did not provide a direct reference for this response. The clinical rationale above remains the Rounds teaching source.</Text> : null}<Text style={[styles.followUp, { color: colors.primary }]}>{followUp ? "A focused follow-up is next to reinforce the missing clinical point." : "Continue when you are ready."}</Text><View style={styles.actionRow}><Pressable onPress={replayRationale} style={[styles.secondaryButton, { borderColor: colors.primary }]} accessibilityRole="button"><Text style={[styles.secondaryText, { color: colors.primary }]}>Replay rationale</Text></Pressable><Pressable onPress={() => void Speech.stop()} style={[styles.secondaryButton, { borderColor: colors.border }]} accessibilityRole="button"><Text style={[styles.secondaryText, { color: colors.foreground }]}>Stop voice</Text></Pressable></View><Pressable onPress={nextQuestion} style={[styles.primaryButton, { backgroundColor: colors.primary }]} accessibilityRole="button"><Text style={[styles.primaryText, { color: colors.background }]}>{followUp ? "Continue to follow-up" : "Next question"}</Text></Pressable></View> : null}

        {phase === "complete" ? <View style={[styles.completeCard, { borderColor: colors.success, backgroundColor: colors.surface }]}><Text style={[styles.completeTitle, { color: colors.foreground }]}>Round complete</Text><Text style={[styles.sub, { color: colors.muted }]}>{notice}</Text><Pressable onPress={() => startRound()} style={[styles.primaryButton, { backgroundColor: colors.primary }]} accessibilityRole="button"><Text style={[styles.primaryText, { color: colors.background }]}>Start a new focused round</Text></Pressable></View> : null}

        {!hasRound && phase !== "complete" ? <Text style={[styles.notice, { color: colors.muted }]}>{notice}</Text> : null}
        <Text style={[styles.footnote, { color: colors.muted }]}>Works offline with downloaded Nursing questions and typed answers. Spoken-answer transcription needs a connection.</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 18, paddingBottom: 40, gap: 16 }, back: { fontSize: 14, fontWeight: "800" }, header: { gap: 6 }, eyebrow: { fontSize: 11, letterSpacing: 1.7, fontWeight: "900" }, title: { fontFamily: "Georgia", fontSize: 30, lineHeight: 38, fontWeight: "700" }, sub: { fontSize: 14, lineHeight: 21 }, topicCard: { borderWidth: 1, borderRadius: 22, padding: 17, gap: 12 }, sectionLabel: { fontSize: 10, letterSpacing: 1.3, fontWeight: "900" }, chips: { flexDirection: "row", flexWrap: "wrap", gap: 7 }, chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 8 }, voiceTopicButton: { minHeight: 44, borderWidth: 1, borderRadius: 14, alignItems: "center", justifyContent: "center" }, voiceTopicText: { fontSize: 13, fontWeight: "900" }, startButton: { minHeight: 48, borderRadius: 15, alignItems: "center", justifyContent: "center" }, startText: { fontSize: 14, fontWeight: "900" }, materialPicker: { borderTopWidth: 1, paddingTop: 12, gap: 8 }, materialPickerCopy: { gap: 3 }, materialPickerTitle: { fontSize: 13, fontWeight: "900" }, materialPickerText: { fontSize: 12, lineHeight: 17 }, materialChips: { flexDirection: "row", flexWrap: "wrap", gap: 7 }, materialChip: { maxWidth: 180, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 8 }, materialChipText: { fontSize: 11, fontWeight: "800" }, materialManage: { fontSize: 12, fontWeight: "900" }, questionCard: { borderWidth: 1.5, borderRadius: 22, padding: 18, gap: 10 }, meta: { flexDirection: "row", justifyContent: "space-between", gap: 10 }, progress: { fontSize: 11, fontWeight: "800" }, question: { fontFamily: "Georgia", fontSize: 23, lineHeight: 32, fontWeight: "700" }, notice: { fontSize: 13, lineHeight: 19 }, actionArea: { gap: 9 }, primaryButton: { minHeight: 54, borderRadius: 17, alignItems: "center", justifyContent: "center", marginTop: 3 }, primaryText: { fontSize: 15, fontWeight: "900" }, input: { minHeight: 86, borderWidth: 1, borderRadius: 16, padding: 14, fontSize: 15, textAlignVertical: "top" }, actionRow: { flexDirection: "row", gap: 8 }, secondaryButton: { minHeight: 42, borderWidth: 1, borderRadius: 13, justifyContent: "center", alignItems: "center", paddingHorizontal: 10, flex: 1 }, secondaryText: { fontSize: 12, fontWeight: "900" }, recordingCard: { borderWidth: 1.5, borderRadius: 18, padding: 15, gap: 10 }, recordingLabel: { fontSize: 12, fontWeight: "900", letterSpacing: 1 }, stopButton: { minHeight: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" }, stopText: { fontSize: 14, fontWeight: "900" }, reviewCard: { borderWidth: 1.5, borderRadius: 22, padding: 17, gap: 9 }, verdict: { fontSize: 12, letterSpacing: 1.3, fontWeight: "900" }, reviewCopy: { fontSize: 15, lineHeight: 22, fontWeight: "800" }, contextTitle: { fontSize: 14, fontWeight: "900", marginTop: 4 }, body: { fontSize: 14, lineHeight: 20 }, sourceCard: { borderWidth: 1, borderRadius: 14, padding: 12, gap: 6, marginTop: 3 }, sourceLabel: { fontSize: 10, letterSpacing: 1.1, fontWeight: "900" }, sourceQuote: { fontSize: 13, lineHeight: 19, fontStyle: "italic", fontWeight: "700" }, sourceExplanation: { fontSize: 12, lineHeight: 18 }, sourceStatus: { fontSize: 12, lineHeight: 18, marginTop: 3 }, followUp: { fontSize: 13, lineHeight: 19, fontWeight: "800", marginTop: 3 }, completeCard: { borderWidth: 1.5, borderRadius: 22, padding: 18, gap: 10 }, completeTitle: { fontFamily: "Georgia", fontSize: 25, fontWeight: "700" }, footnote: { fontSize: 11, lineHeight: 16, textAlign: "center", paddingHorizontal: 8 }, pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
});

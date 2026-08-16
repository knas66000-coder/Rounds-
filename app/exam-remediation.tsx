import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { questionBank, type Question } from "@/data/questionBank";
import { getExamRemediationQuestionIds, recordLearningOutcome } from "@/lib/adaptive-store";
import { evaluateAnswer, type Evaluation } from "@/lib/rounds";
import { haptic } from "@/lib/haptics";
import { useColors } from "@/hooks/use-colors";

export default function ExamRemediationScreen() {
  const colors = useColors();
  const router = useRouter();
  const [queue, setQueue] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState("");
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [complete, setComplete] = useState(false);

  useFocusEffect(useCallback(() => {
    let active = true;
    getExamRemediationQuestionIds().then((ids) => {
      if (!active) return;
      const idsSet = new Set(ids);
      setQueue(questionBank.filter((question) => idsSet.has(question.id)));
      setIndex(0);
      setDraft("");
      setEvaluation(null);
      setComplete(false);
    });
    return () => { active = false; };
  }, []));

  const question = queue[index];
  const submit = async () => {
    if (!question || !draft.trim()) return;
    const next = evaluateAnswer(draft, question);
    setEvaluation(next);
    await recordLearningOutcome(question.id, next.verdict);
    if (next.verdict === "correct") haptic.success();
    else if (next.verdict === "partial") haptic.warning();
    else haptic.error();
  };
  const next = () => {
    haptic.light();
    if (index + 1 === queue.length) { setComplete(true); return; }
    setIndex((current) => current + 1);
    setDraft("");
    setEvaluation(null);
  };

  if (!question || complete) return <ScreenContainer className="px-5" edges={["top", "left", "right"]}><View style={styles.empty}><Text style={[styles.eyebrow, { color: colors.primary }]}>POST-EXAM REMEDIATION</Text><Text style={[styles.title, { color: colors.foreground }]}>{complete ? "Remediation round complete." : "No questions selected."}</Text><Text style={[styles.body, { color: colors.muted }]}>{complete ? "You revisited every selected weak or flagged item exactly once. Your new results now inform Adaptive Review." : "Return to your mock-exam results and choose a filter, then start a remediation round."}</Text><Pressable onPress={() => router.replace("/(tabs)/study")} accessibilityRole="button" style={[styles.primary, { backgroundColor: colors.primary }]}><Text style={[styles.primaryText, { color: colors.background }]}>Return to study tools</Text></Pressable></View></ScreenContainer>;
  const verdictColor = evaluation?.verdict === "correct" ? colors.success : evaluation?.verdict === "partial" ? colors.warning : colors.error;
  return <ScreenContainer className="px-5" edges={["top", "left", "right"]}><ScrollView contentContainerStyle={styles.content}><View style={styles.topRow}><Pressable onPress={() => router.back()} accessibilityRole="button"><Text style={[styles.back, { color: colors.primary }]}>‹ Exam results</Text></Pressable><Text style={[styles.progress, { color: colors.muted }]}>{index + 1} OF {queue.length}</Text></View><Text style={[styles.eyebrow, { color: colors.primary }]}>POST-EXAM REMEDIATION</Text><Text style={[styles.title, { color: colors.foreground }]}>Close the gap.</Text><View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={[styles.category, { color: colors.primary }]}>{question.cat.toUpperCase()}</Text><Text style={[styles.question, { color: colors.foreground }]}>{question.q}</Text></View>{evaluation ? <View style={[styles.feedback, { borderColor: verdictColor, backgroundColor: colors.surface }]}><Text style={[styles.verdict, { color: verdictColor }]}>{evaluation.verdict.toUpperCase()}</Text><Text style={[styles.body, { color: colors.muted }]}>{evaluation.feedback}</Text><Text style={[styles.answerLabel, { color: colors.primary }]}>KEY ANSWER</Text><Text style={[styles.answer, { color: colors.foreground }]}>{question.a}</Text><Text style={[styles.answerLabel, { color: colors.primary }]}>CLINICAL REASONING</Text><Text style={[styles.body, { color: colors.muted }]}>{question.clinicalSignificance}</Text><Pressable onPress={next} accessibilityRole="button" style={[styles.primary, { backgroundColor: colors.primary }]}><Text style={[styles.primaryText, { color: colors.background }]}>{index + 1 === queue.length ? "Complete remediation" : "Next selected question"}</Text></Pressable></View> : <><TextInput value={draft} onChangeText={setDraft} placeholder="Type your clinical response" placeholderTextColor={colors.muted} multiline textAlignVertical="top" style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.foreground }]} /><Pressable onPress={() => void submit()} disabled={!draft.trim()} accessibilityRole="button" style={[styles.primary, { backgroundColor: colors.primary, opacity: draft.trim() ? 1 : 0.45 }]}><Text style={[styles.primaryText, { color: colors.background }]}>Check response</Text></Pressable></>}</ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { paddingTop: 18, paddingBottom: 36, gap: 14 }, empty: { flex: 1, justifyContent: "center", gap: 16 }, topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, back: { fontSize: 14, fontWeight: "900" }, progress: { fontSize: 11, fontWeight: "900", letterSpacing: 1 }, eyebrow: { fontSize: 11, letterSpacing: 1.7, fontWeight: "900" }, title: { fontFamily: "Georgia", fontSize: 30, lineHeight: 38, fontWeight: "700" }, body: { fontSize: 14, lineHeight: 21 }, card: { borderWidth: 1, borderRadius: 22, padding: 18, gap: 12 }, category: { fontSize: 10, fontWeight: "900", letterSpacing: 1.3 }, question: { fontFamily: "Georgia", fontSize: 23, lineHeight: 32, fontWeight: "700" }, input: { minHeight: 128, borderWidth: 1, borderRadius: 18, padding: 14, fontSize: 16 }, feedback: { borderWidth: 1.5, borderRadius: 22, padding: 17, gap: 9 }, verdict: { fontSize: 13, fontWeight: "900", letterSpacing: 1.2 }, answerLabel: { fontSize: 10, fontWeight: "900", letterSpacing: 1.2, marginTop: 2 }, answer: { fontSize: 15, fontWeight: "700", lineHeight: 22 }, primary: { minHeight: 56, borderRadius: 17, alignItems: "center", justifyContent: "center", marginTop: 3 }, primaryText: { fontSize: 15, fontWeight: "900" } });

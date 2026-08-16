import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { questionBank } from "@/data/questionBank";
import { bookmarkIds, BOOKMARKS_KEY, parseBookmarks } from "@/lib/bookmarks";
import { buildAdaptiveQueue, LEARNING_SIGNALS_KEY, parseLearningSignals, type AdaptiveItem } from "@/lib/adaptive";
import { recordLearningOutcome } from "@/lib/adaptive-store";
import { evaluateAnswer, type Evaluation } from "@/lib/rounds";
import { haptic } from "@/lib/haptics";
import { useColors } from "@/hooks/use-colors";

const reasonLabels = { missed: "Missed", partial: "Partial", flagged: "Flagged", saved: "Saved" } as const;

export default function AdaptiveReviewScreen() {
  const colors = useColors();
  const router = useRouter();
  const [queue, setQueue] = useState<AdaptiveItem[]>([]);
  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState("");
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [complete, setComplete] = useState(false);

  const refreshQueue = useCallback(() => {
    let active = true;
    Promise.all([AsyncStorage.getItem(LEARNING_SIGNALS_KEY), AsyncStorage.getItem(BOOKMARKS_KEY)]).then(([signalValue, bookmarkValue]) => {
      if (!active) return;
      setQueue(buildAdaptiveQueue(questionBank, parseLearningSignals(signalValue), bookmarkIds(parseBookmarks(bookmarkValue))));
      setIndex(0);
      setDraft("");
      setEvaluation(null);
      setComplete(false);
    });
    return () => { active = false; };
  }, []);

  useFocusEffect(refreshQueue);

  const item = queue[index];
  const submit = async () => {
    if (!item || !draft.trim()) return;
    const next = evaluateAnswer(draft, item.question);
    setEvaluation(next);
    await recordLearningOutcome(item.question.id, next.verdict);
    if (next.verdict === "correct") haptic.success();
    else if (next.verdict === "partial") haptic.warning();
    else haptic.error();
  };

  const next = () => {
    haptic.light();
    if (index + 1 >= queue.length) { setComplete(true); return; }
    setIndex((current) => current + 1);
    setDraft("");
    setEvaluation(null);
  };

  if (!item || complete) {
    return <ScreenContainer className="px-5" edges={["top", "left", "right"]}><View style={styles.emptyWrap}><Pressable onPress={() => router.back()} accessibilityRole="button"><Text style={[styles.back, { color: colors.primary }]}>‹ Study tools</Text></Pressable><Text style={[styles.eyebrow, { color: colors.primary }]}>ADAPTIVE REVIEW</Text><Text style={[styles.title, { color: colors.foreground }]}>{complete ? "Priority round complete." : "Your review list is clear."}</Text><Text style={[styles.sub, { color: colors.muted }]}>{complete ? "You worked through every current priority question. New misses, partial answers, flagged items, and bookmarks will shape the next round." : "Adaptive review becomes available when you miss, partly answer, flag, or save a question. The highest-priority items appear first."}</Text><View style={[styles.ruleCard, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={[styles.ruleTitle, { color: colors.foreground }]}>How priority works</Text><Text style={[styles.sub, { color: colors.muted }]}>Missed questions receive the strongest priority, followed by partial responses, flagged exam questions, and saved questions. A question appears only once per review round.</Text></View><Pressable onPress={() => router.replace("/(tabs)")} accessibilityRole="button" style={[styles.primaryButton, { backgroundColor: colors.primary }]}><Text style={[styles.primaryText, { color: colors.background }]}>Practice a new question</Text></Pressable></View></ScreenContainer>;
  }

  const verdictColor = evaluation?.verdict === "correct" ? colors.success : evaluation?.verdict === "partial" ? colors.warning : colors.error;
  return <ScreenContainer className="px-5" edges={["top", "left", "right"]}><ScrollView contentContainerStyle={styles.content}><View style={styles.topRow}><Pressable onPress={() => router.back()} accessibilityRole="button"><Text style={[styles.back, { color: colors.primary }]}>‹ Study tools</Text></Pressable><Text style={[styles.progress, { color: colors.muted }]}>{index + 1} OF {queue.length}</Text></View><Text style={[styles.eyebrow, { color: colors.primary }]}>ADAPTIVE REVIEW</Text><Text style={[styles.title, { color: colors.foreground }]}>Target your next step.</Text><View style={[styles.questionCard, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={[styles.category, { color: colors.primary }]}>{item.question.cat.toUpperCase()}</Text><Text style={[styles.question, { color: colors.foreground }]}>{item.question.q}</Text><Text style={[styles.reasonTitle, { color: colors.muted }]}>PRIORITIZED BECAUSE</Text><View style={styles.reasonRow}>{item.reasons.map((reason) => <View key={reason} style={[styles.reasonChip, { borderColor: colors.border, backgroundColor: colors.background }]}><Text style={[styles.reasonText, { color: colors.foreground }]}>{reasonLabels[reason]}</Text></View>)}</View></View>{evaluation ? <View style={[styles.feedbackCard, { borderColor: verdictColor, backgroundColor: colors.surface }]}><Text style={[styles.verdict, { color: verdictColor }]}>{evaluation.verdict.toUpperCase()}</Text><Text style={[styles.body, { color: colors.muted }]}>{evaluation.feedback}</Text><Text style={[styles.answerLabel, { color: colors.primary }]}>KEY ANSWER</Text><Text style={[styles.answer, { color: colors.foreground }]}>{item.question.a}</Text><Text style={[styles.answerLabel, { color: colors.primary }]}>WHY IT MATTERS</Text><Text style={[styles.body, { color: colors.muted }]}>{item.question.clinicalSignificance}</Text><Pressable onPress={next} accessibilityRole="button" style={[styles.primaryButton, { backgroundColor: colors.primary }]}><Text style={[styles.primaryText, { color: colors.background }]}>{index + 1 === queue.length ? "Complete review round" : "Next priority question"}</Text></Pressable></View> : <><TextInput value={draft} onChangeText={setDraft} placeholder="Say or type your clinical response" placeholderTextColor={colors.muted} style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.foreground }]} multiline textAlignVertical="top" /><Pressable onPress={() => void submit()} disabled={!draft.trim()} accessibilityRole="button" style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: draft.trim() ? 1 : 0.45 }]}><Text style={[styles.primaryText, { color: colors.background }]}>Check response</Text></Pressable></>}</ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { paddingTop: 18, paddingBottom: 36, gap: 14 }, emptyWrap: { flex: 1, justifyContent: "center", gap: 16 }, topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, back: { fontSize: 14, fontWeight: "900" }, progress: { fontSize: 11, fontWeight: "900", letterSpacing: 1 }, eyebrow: { fontSize: 11, fontWeight: "900", letterSpacing: 1.7 }, title: { fontFamily: "Georgia", fontSize: 30, lineHeight: 38, fontWeight: "700" }, sub: { fontSize: 14, lineHeight: 21 }, questionCard: { borderWidth: 1, borderRadius: 22, padding: 18, gap: 12 }, category: { fontSize: 10, fontWeight: "900", letterSpacing: 1.2 }, question: { fontFamily: "Georgia", fontSize: 23, lineHeight: 32, fontWeight: "700" }, reasonTitle: { fontSize: 10, fontWeight: "900", letterSpacing: 1.2, marginTop: 2 }, reasonRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 }, reasonChip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }, reasonText: { fontSize: 12, fontWeight: "800" }, input: { minHeight: 125, borderWidth: 1, borderRadius: 18, padding: 14, fontSize: 16 }, feedbackCard: { borderWidth: 1.5, borderRadius: 22, padding: 17, gap: 9 }, verdict: { fontSize: 13, letterSpacing: 1.3, fontWeight: "900" }, body: { fontSize: 14, lineHeight: 21 }, answerLabel: { fontSize: 10, letterSpacing: 1.2, fontWeight: "900", marginTop: 3 }, answer: { fontSize: 15, lineHeight: 22, fontWeight: "700" }, primaryButton: { minHeight: 56, borderRadius: 17, justifyContent: "center", alignItems: "center", marginTop: 4 }, primaryText: { fontSize: 15, fontWeight: "900" }, ruleCard: { borderWidth: 1, borderRadius: 20, padding: 17, gap: 6 }, ruleTitle: { fontSize: 16, fontWeight: "900" } });

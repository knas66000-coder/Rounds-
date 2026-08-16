import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { questionBank, type Question } from "@/data/questionBank";
import { bookmarkIds, BOOKMARKS_KEY, parseBookmarks, toggleBookmark, type Bookmark } from "@/lib/bookmarks";
import { createMockExamQueue, MOCK_EXAM_DURATION_SECONDS, MOCK_EXAM_QUESTION_COUNT, remainingSeconds, summarizeMockExam } from "@/lib/mock-exam";
import { haptic } from "@/lib/haptics";
import { useColors } from "@/hooks/use-colors";

type ExamState = "setup" | "exam" | "results";

function formatTime(total: number) {
  const minutes = Math.floor(total / 60).toString().padStart(2, "0");
  const seconds = (total % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function MockExamScreen() {
  const colors = useColors();
  const router = useRouter();
  const [state, setState] = useState<ExamState>("setup");
  const [queue, setQueue] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flaggedIds, setFlaggedIds] = useState<string[]>([]);
  const [deadline, setDeadline] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const remaining = deadline ? remainingSeconds(deadline, now) : MOCK_EXAM_DURATION_SECONDS;
  const question = queue[index];
  const summary = useMemo(() => state === "results" ? summarizeMockExam(queue, answers) : null, [answers, queue, state]);

  useEffect(() => {
    AsyncStorage.getItem(BOOKMARKS_KEY).then((value) => setBookmarks(parseBookmarks(value)));
  }, []);

  const finishExam = useCallback((timeExpired = false) => {
    if (state !== "exam") return;
    haptic.medium();
    setState("results");
    if (timeExpired) Alert.alert("Time is up", "Your mock-exam responses have been submitted for scoring.");
  }, [state]);

  useEffect(() => {
    if (state !== "exam") return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [state]);

  useEffect(() => {
    if (state === "exam" && remaining === 0) finishExam(true);
  }, [finishExam, remaining, state]);

  const startExam = () => {
    haptic.medium();
    const nextQueue = createMockExamQueue(questionBank);
    setQueue(nextQueue);
    setIndex(0);
    setAnswers({});
    setFlaggedIds([]);
    setDeadline(Date.now() + MOCK_EXAM_DURATION_SECONDS * 1000);
    setNow(Date.now());
    setState("exam");
  };

  const requestFinish = () => {
    Alert.alert("Submit mock exam?", "You cannot change responses after submission. Unanswered questions will be counted separately.", [
      { text: "Keep reviewing", style: "cancel" },
      { text: "Submit exam", style: "destructive", onPress: () => finishExam() },
    ]);
  };

  const updateAnswer = (value: string) => {
    setAnswers((current) => ({ ...current, [question.id]: value }));
  };

  const toggleFlag = () => {
    setFlaggedIds((current) => current.includes(question.id) ? current.filter((id) => id !== question.id) : [...current, question.id]);
    haptic.light();
  };

  const toggleCurrentBookmark = () => {
    const next = toggleBookmark(bookmarks, question.id);
    setBookmarks(next);
    void AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next));
    haptic.light();
  };

  if (state === "setup") {
    return <ScreenContainer className="px-5" edges={["top", "left", "right"]}><ScrollView contentContainerStyle={styles.setup}><Pressable onPress={() => router.back()} accessibilityRole="button"><Text style={[styles.back, { color: colors.primary }]}>‹ Study tools</Text></Pressable><Text style={[styles.eyebrow, { color: colors.primary }]}>TIMED STUDY SIMULATION</Text><Text style={[styles.title, { color: colors.foreground }]}>Mock Exam</Text><Text style={[styles.sub, { color: colors.muted }]}>A focused, timed NCLEX-style study session built from unique questions in your bank.</Text><View style={[styles.setupCard, { borderColor: colors.border, backgroundColor: colors.surface }]}><Metric label="Questions" value={String(MOCK_EXAM_QUESTION_COUNT)} color={colors.foreground} /><Metric label="Time limit" value="60 min" color={colors.primary} /><Metric label="Feedback" value="After submit" color={colors.foreground} /></View><View style={[styles.noteCard, { borderColor: colors.border }]}><Text style={[styles.noteTitle, { color: colors.foreground }]}>Exam rules</Text><Text style={[styles.sub, { color: colors.muted }]}>Questions are randomized without repetition. Teaching feedback stays hidden until you submit. You can flag items, edit answers, and finish early. This is a study simulation, not an official NCLEX administration.</Text></View><Pressable onPress={startExam} accessibilityRole="button" style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.primary }, pressed && styles.pressed]}><Text style={[styles.primaryButtonText, { color: colors.background }]}>Begin timed exam</Text></Pressable></ScrollView></ScreenContainer>;
  }

  if (state === "results" && summary) {
    const timeUsed = MOCK_EXAM_DURATION_SECONDS - remaining;
    return <ScreenContainer className="px-5" edges={["top", "left", "right"]}><ScrollView contentContainerStyle={styles.setup}><Text style={[styles.eyebrow, { color: colors.primary }]}>MOCK EXAM COMPLETE</Text><Text style={[styles.title, { color: colors.foreground }]}>Your results</Text><View style={[styles.scoreCard, { backgroundColor: colors.primary }]}><Text style={[styles.scoreValue, { color: colors.background }]}>{summary.score}%</Text><Text style={[styles.scoreLabel, { color: colors.background }]}>keyword-based score</Text><Text style={[styles.scoreMeta, { color: colors.background }]}>{formatTime(timeUsed)} used · {flaggedIds.length} flagged</Text></View><View style={[styles.setupCard, { borderColor: colors.border, backgroundColor: colors.surface }]}><Metric label="Correct" value={String(summary.correct)} color={colors.success} /><Metric label="Partial" value={String(summary.partial)} color={colors.warning} /><Metric label="Missed" value={String(summary.incorrect)} color={colors.error} /><Metric label="Unanswered" value={String(summary.unanswered)} color={colors.muted} /></View><View style={[styles.noteCard, { borderColor: colors.border }]}><Text style={[styles.noteTitle, { color: colors.foreground }]}>Next step</Text><Text style={[styles.sub, { color: colors.muted }]}>{summary.unanswered ? "Review unanswered and flagged questions first, then use Bookmarks to build a focused revision list." : summary.score >= 70 ? "Review flagged concepts and continue with another targeted category round." : "Use the result to identify weak concepts, bookmark difficult questions, and return to focused practice."}</Text></View><Pressable onPress={() => router.replace("/(tabs)/study")} accessibilityRole="button" style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.primary }, pressed && styles.pressed]}><Text style={[styles.primaryButtonText, { color: colors.background }]}>Return to study tools</Text></Pressable><Pressable onPress={startExam} accessibilityRole="button" style={[styles.secondaryButton, { borderColor: colors.border }]}><Text style={[styles.secondaryText, { color: colors.primary }]}>Start another mock exam</Text></Pressable></ScrollView></ScreenContainer>;
  }

  const saved = bookmarkIds(bookmarks).includes(question.id);
  const flagged = flaggedIds.includes(question.id);
  const answeredCount = Object.values(answers).filter((answer) => answer.trim()).length;
  return <ScreenContainer className="px-5" edges={["top", "left", "right"]}><View style={styles.exam}><View style={styles.examHeader}><Pressable onPress={requestFinish} accessibilityRole="button"><Text style={[styles.end, { color: colors.error }]}>End exam</Text></Pressable><View style={[styles.timer, { backgroundColor: remaining < 300 ? colors.error : colors.surface, borderColor: colors.border }]}><Text style={[styles.timerText, { color: remaining < 300 ? colors.background : colors.foreground }]}>{formatTime(remaining)}</Text></View></View><View style={styles.progressRow}><Text style={[styles.progress, { color: colors.muted }]}>QUESTION {index + 1} OF {queue.length}</Text><Text style={[styles.progress, { color: colors.muted }]}>{answeredCount} answered</Text></View><View style={[styles.questionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.category, { color: colors.primary }]}>{question.cat.toUpperCase()}</Text><Text style={[styles.examQuestion, { color: colors.foreground }]}>{question.q}</Text><View style={styles.examActions}><Pressable onPress={toggleFlag} accessibilityRole="button" style={[styles.chip, { borderColor: flagged ? colors.warning : colors.border, backgroundColor: flagged ? colors.warning : colors.background }]}><Text style={{ color: flagged ? colors.background : colors.foreground, fontWeight: "800" }}>{flagged ? "⚑ Flagged" : "⚐ Flag"}</Text></Pressable><Pressable onPress={toggleCurrentBookmark} accessibilityRole="button" style={[styles.chip, { borderColor: saved ? colors.primary : colors.border, backgroundColor: saved ? colors.primary : colors.background }]}><Text style={{ color: saved ? colors.background : colors.primary, fontWeight: "800" }}>{saved ? "★ Saved" : "☆ Save"}</Text></Pressable></View></View><TextInput value={answers[question.id] ?? ""} onChangeText={updateAnswer} placeholder="Type your clinical response" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, backgroundColor: colors.surface, borderColor: colors.border }]} multiline textAlignVertical="top" /><View style={styles.navigation}><Pressable onPress={() => setIndex((current) => Math.max(0, current - 1))} disabled={index === 0} accessibilityRole="button" style={[styles.navButton, { borderColor: colors.border, opacity: index === 0 ? 0.45 : 1 }]}><Text style={[styles.navText, { color: colors.foreground }]}>Previous</Text></Pressable>{index === queue.length - 1 ? <Pressable onPress={requestFinish} accessibilityRole="button" style={[styles.navButton, { backgroundColor: colors.primary, borderColor: colors.primary }]}><Text style={[styles.navText, { color: colors.background }]}>Review & submit</Text></Pressable> : <Pressable onPress={() => setIndex((current) => Math.min(queue.length - 1, current + 1))} accessibilityRole="button" style={[styles.navButton, { backgroundColor: colors.primary, borderColor: colors.primary }]}><Text style={[styles.navText, { color: colors.background }]}>Next</Text></Pressable>}</View></View></ScreenContainer>;
}

function Metric({ label, value, color }: { label: string; value: string; color: string }) { return <View style={styles.metric}><Text style={[styles.metricValue, { color }]}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>; }

const styles = StyleSheet.create({ setup: { paddingTop: 18, paddingBottom: 36, gap: 16 }, back: { fontSize: 14, fontWeight: "800" }, eyebrow: { fontSize: 11, letterSpacing: 1.7, fontWeight: "900" }, title: { fontFamily: "Georgia", fontSize: 31, lineHeight: 39, fontWeight: "700" }, sub: { fontSize: 14, lineHeight: 21 }, setupCard: { borderWidth: 1, borderRadius: 22, padding: 18, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 16 }, metric: { minWidth: 74, gap: 3 }, metricValue: { fontSize: 21, fontWeight: "900" }, metricLabel: { fontSize: 11, color: "#687076", fontWeight: "700" }, noteCard: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 6 }, noteTitle: { fontSize: 16, fontWeight: "900" }, primaryButton: { minHeight: 58, borderRadius: 18, justifyContent: "center", alignItems: "center" }, primaryButtonText: { fontSize: 16, fontWeight: "900" }, secondaryButton: { minHeight: 48, borderRadius: 16, borderWidth: 1, justifyContent: "center", alignItems: "center" }, secondaryText: { fontSize: 14, fontWeight: "900" }, pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] }, scoreCard: { borderRadius: 24, padding: 24, alignItems: "center", gap: 3 }, scoreValue: { fontSize: 52, fontWeight: "900" }, scoreLabel: { fontSize: 13, fontWeight: "800" }, scoreMeta: { fontSize: 12, marginTop: 4 }, exam: { flex: 1, paddingTop: 18, paddingBottom: 16, gap: 14 }, examHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, end: { fontSize: 14, fontWeight: "900" }, timer: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8 }, timerText: { fontSize: 18, fontWeight: "900", fontVariant: ["tabular-nums"] }, progressRow: { flexDirection: "row", justifyContent: "space-between" }, progress: { fontSize: 11, fontWeight: "900", letterSpacing: 0.8 }, questionCard: { borderWidth: 1, borderRadius: 22, padding: 18, gap: 14 }, category: { fontSize: 10, letterSpacing: 1.3, fontWeight: "900" }, examQuestion: { fontFamily: "Georgia", fontSize: 24, lineHeight: 33, fontWeight: "700" }, examActions: { flexDirection: "row", gap: 8 }, chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 }, input: { flex: 1, minHeight: 130, borderWidth: 1, borderRadius: 18, padding: 14, fontSize: 16 }, navigation: { flexDirection: "row", justifyContent: "space-between", gap: 12 }, navButton: { flex: 1, minHeight: 52, borderWidth: 1, borderRadius: 16, alignItems: "center", justifyContent: "center" }, navText: { fontSize: 14, fontWeight: "900" } });

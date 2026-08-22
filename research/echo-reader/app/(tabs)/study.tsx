import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { generateStudyQuestions, type StudyQuestion } from "@/lib/document-assistant";
import type { LocalDocument } from "@/lib/document-search";
import { loadLocalDocument } from "@/lib/local-document-store";
import { useColors } from "@/hooks/use-colors";

export default function StudyScreen() {
  const colors = useColors();
  const router = useRouter();
  const [document, setDocument] = useState<LocalDocument | null>(null);
  const [selectedPassageIndex, setSelectedPassageIndex] = useState(0);
  const [questions, setQuestions] = useState<StudyQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const passage = document?.passages[selectedPassageIndex] ?? null;
  const currentQuestion = questions[questionIndex] ?? null;
  const passageOptions = useMemo(() => document?.passages.slice(0, 6) ?? [], [document]);

  useEffect(() => { const restore = async () => { try { setDocument(await loadLocalDocument()); } finally { setLoading(false); } }; void restore(); }, []);
  useEffect(() => {
    if (!autoMode || !revealed || questions.length < 2) return;
    const timer = setTimeout(() => { setQuestionIndex((current) => (current + 1) % questions.length); setRevealed(false); }, 2600);
    return () => clearTimeout(timer);
  }, [autoMode, revealed, questions.length, questionIndex]);

  const createQuestions = () => {
    if (!passage) return;
    setQuestions(generateStudyQuestions(passage));
    setQuestionIndex(0);
    setRevealed(false);
  };
  const nextQuestion = () => { if (!questions.length) return; setQuestionIndex((current) => (current + 1) % questions.length); setRevealed(false); };

  if (loading) return <ScreenContainer className="items-center justify-center"><ActivityIndicator color={colors.primary} /></ScreenContainer>;
  if (!document) return <ScreenContainer className="px-5" containerClassName="bg-background"><View style={styles.emptyPage}><View style={[styles.emptyIcon, { backgroundColor: "rgba(124,108,255,0.14)" }]}><MaterialIcons name="school" size={38} color={colors.primary} /></View><Text style={[styles.emptyTitle, { color: colors.foreground }]}>Study from a local document</Text><Text style={[styles.emptyCopy, { color: colors.muted }]}>Load a PDF, TXT, or Markdown document first. Study questions always keep their source passage.</Text><Pressable onPress={() => router.replace("/")} style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.primary }, pressed && styles.pressed]}><MaterialIcons name="folder-open" size={19} color="#FFFFFF" /><Text style={styles.primaryText}>Open Reader</Text></Pressable></View></ScreenContainer>;

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}><View style={[styles.iconBadge, { backgroundColor: "rgba(124,108,255,0.14)" }]}><MaterialIcons name="school" size={22} color={colors.primary} /></View><View style={styles.headerCopy}><Text style={[styles.eyebrow, { color: colors.primary }]}>LOCAL STUDY MODE</Text><Text style={[styles.title, { color: colors.foreground }]}>Question maker</Text></View></View>
        <View style={[styles.modeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={styles.modeCopy}><Text style={[styles.modeTitle, { color: colors.foreground }]}>Auto study mode</Text><Text style={[styles.modeText, { color: colors.muted }]}>Reveal an answer, then move to the next question automatically.</Text></View><Switch value={autoMode} onValueChange={setAutoMode} trackColor={{ false: colors.border, true: colors.primary }} thumbColor="#FFFFFF" /></View>
        <Text style={[styles.label, { color: colors.muted }]}>CHOOSE A SOURCE PASSAGE</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.passageScroll}>{passageOptions.map((item, index) => <Pressable key={item.id} onPress={() => { setSelectedPassageIndex(index); setQuestions([]); setRevealed(false); }} style={({ pressed }) => [styles.passageChoice, { backgroundColor: colors.surface, borderColor: index === selectedPassageIndex ? colors.primary : colors.border }, pressed && styles.pressed]}><Text style={[styles.passageChoicePage, { color: colors.primary }]}>PAGE {item.page}</Text><Text numberOfLines={3} style={[styles.passageChoiceText, { color: colors.foreground }]}>{item.text}</Text></Pressable>)}</ScrollView>
        {passage ? <View style={[styles.sourceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.sourceLabel, { color: colors.primary }]}>SELECTED CONTEXT · PAGE {passage.page}</Text><Text numberOfLines={4} style={[styles.sourceText, { color: colors.muted }]}>{passage.text}</Text></View> : null}
        <Pressable onPress={createQuestions} style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.primary }, pressed && styles.pressed]}><MaterialIcons name="auto-awesome" size={19} color="#FFFFFF" /><Text style={styles.primaryText}>Generate local questions</Text></Pressable>
        {currentQuestion ? <View style={[styles.questionCard, { backgroundColor: colors.surface, borderColor: colors.success }]}><View style={styles.questionHeader}><Text style={[styles.questionMeta, { color: colors.success }]}>QUESTION {questionIndex + 1} OF {questions.length} · PAGE {currentQuestion.page}</Text><MaterialIcons name="verified" size={18} color={colors.success} /></View><Text style={[styles.questionText, { color: colors.foreground }]}>{currentQuestion.question}</Text>{revealed ? <View style={[styles.answerBox, { backgroundColor: "rgba(79,209,197,0.1)" }]}><Text style={[styles.answerLabel, { color: colors.success }]}>SOURCE-BASED ANSWER</Text><Text style={[styles.answerText, { color: colors.foreground }]}>{currentQuestion.answer}</Text></View> : null}<View style={styles.questionActions}><Pressable onPress={() => setRevealed((current) => !current)} style={({ pressed }) => [styles.secondaryButton, { borderColor: colors.primary }, pressed && styles.pressed]}><Text style={[styles.secondaryText, { color: colors.primary }]}>{revealed ? "Hide answer" : "Reveal answer"}</Text></Pressable><Pressable onPress={nextQuestion} style={({ pressed }) => [styles.nextButton, { backgroundColor: colors.primary }, pressed && styles.pressed]}><MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" /></Pressable></View>{autoMode && revealed ? <Text style={[styles.autoHint, { color: colors.muted }]}>Auto mode will show the next question shortly.</Text> : null}</View> : null}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ content: { paddingTop: 20, paddingBottom: 32, gap: 15 }, emptyPage: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28, gap: 15 }, emptyIcon: { width: 76, height: 76, borderRadius: 25, alignItems: "center", justifyContent: "center" }, emptyTitle: { fontSize: 23, fontWeight: "800", textAlign: "center" }, emptyCopy: { fontSize: 14, lineHeight: 21, textAlign: "center" }, headerRow: { flexDirection: "row", alignItems: "center", gap: 10 }, iconBadge: { width: 43, height: 43, borderRadius: 14, alignItems: "center", justifyContent: "center" }, headerCopy: { flex: 1 }, eyebrow: { fontSize: 10, fontWeight: "800", letterSpacing: 1.3 }, title: { fontSize: 28, lineHeight: 34, fontWeight: "800", letterSpacing: -0.5 }, modeCard: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 17, padding: 14, gap: 12 }, modeCopy: { flex: 1 }, modeTitle: { fontSize: 15, fontWeight: "800" }, modeText: { fontSize: 12, lineHeight: 17, marginTop: 3 }, label: { fontSize: 10, fontWeight: "800", letterSpacing: 1.3, marginTop: 3 }, passageScroll: { gap: 9 }, passageChoice: { width: 190, minHeight: 122, borderWidth: 1, borderRadius: 16, padding: 13, gap: 7 }, passageChoicePage: { fontSize: 10, fontWeight: "800", letterSpacing: 0.8 }, passageChoiceText: { fontSize: 12, lineHeight: 18, fontWeight: "600" }, sourceCard: { borderWidth: 1, borderRadius: 17, padding: 14, gap: 7 }, sourceLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 0.8 }, sourceText: { fontSize: 13, lineHeight: 20 }, primaryButton: { minHeight: 55, borderRadius: 18, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 }, primaryText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" }, questionCard: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 14 }, questionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, questionMeta: { fontSize: 10, letterSpacing: 0.7, fontWeight: "800" }, questionText: { fontSize: 19, lineHeight: 27, fontWeight: "800" }, answerBox: { borderRadius: 14, padding: 13, gap: 6 }, answerLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 0.8 }, answerText: { fontSize: 14, lineHeight: 21, fontWeight: "600" }, questionActions: { flexDirection: "row", gap: 9 }, secondaryButton: { flex: 1, minHeight: 48, borderWidth: 1, borderRadius: 14, alignItems: "center", justifyContent: "center" }, secondaryText: { fontSize: 14, fontWeight: "800" }, nextButton: { width: 50, minHeight: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" }, autoHint: { textAlign: "center", fontSize: 12 }, pressed: { opacity: 0.84, transform: [{ scale: 0.98 }] }, });

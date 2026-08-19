import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { questionBank } from "@/data/questionBank";
import { bookmarkIds, BOOKMARKS_KEY, parseBookmarks, type Bookmark } from "@/lib/bookmarks";
import { buildAdaptiveQueue, LEARNING_SIGNALS_KEY, parseLearningSignals, type LearningSignal } from "@/lib/adaptive";
import { haptic } from "@/lib/haptics";
import { useColors } from "@/hooks/use-colors";

type StudyView = "home" | "bookmarks";
type ToolId = "voice" | "updates" | "oral" | "adaptive" | "bookmarks";
type StudyTool = { id: ToolId; label: string; title: string; description: string; accent: string };

export default function StudyScreen() {
  const colors = useColors();
  const router = useRouter();
  const [view, setView] = useState<StudyView>("home");
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [signals, setSignals] = useState<LearningSignal[]>([]);
  const savedIds = bookmarkIds(bookmarks);
  const savedQuestions = useMemo(() => questionBank.filter((question) => savedIds.includes(question.id)), [savedIds]);
  const adaptiveItems = useMemo(() => buildAdaptiveQueue(questionBank, signals, savedIds), [savedIds, signals]);

  const loadBookmarks = useCallback(() => {
    let active = true;
    Promise.all([AsyncStorage.getItem(BOOKMARKS_KEY), AsyncStorage.getItem(LEARNING_SIGNALS_KEY)]).then(([bookmarkValue, signalValue]) => {
      if (active) { setBookmarks(parseBookmarks(bookmarkValue)); setSignals(parseLearningSignals(signalValue)); }
    });
    return () => { active = false; };
  }, []);

  useFocusEffect(loadBookmarks);

  const removeBookmark = (questionId: string) => {
    const next = bookmarks.filter((bookmark) => bookmark.questionId !== questionId);
    setBookmarks(next);
    void AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next));
    haptic.light();
  };

  const openTool = (toolId: ToolId) => {
    haptic.light();
    if (toolId === "voice") router.push("/voice-tutor" as never);
    if (toolId === "updates") router.push("/research-updates" as never);
    if (toolId === "oral") router.push("/oral-exam" as never);
    if (toolId === "adaptive") router.push("/adaptive-review" as never);
    if (toolId === "bookmarks") setView("bookmarks");
  };

  if (view === "bookmarks") {
    return (
      <ScreenContainer className="px-5" edges={["top", "left", "right"]}>
        <FlatList
          data={savedQuestions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<View style={styles.listHeader}><Pressable onPress={() => { haptic.light(); setView("home"); }} accessibilityRole="button" style={({ pressed }) => [styles.backButton, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}><Text style={[styles.backText, { color: colors.primary }]}>‹ Study</Text></Pressable><Text style={[styles.eyebrow, { color: colors.primary }]}>SAVED FOR LATER</Text><Text style={[styles.title, { color: colors.foreground }]}>Bookmarks</Text><Text style={[styles.sub, { color: colors.muted }]}>{savedQuestions.length ? `${savedQuestions.length} questions ready for another pass.` : "Save questions during a round to collect them here."}</Text></View>}
          ListEmptyComponent={<View style={[styles.empty, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={[styles.emptyTitle, { color: colors.foreground }]}>Nothing saved yet</Text><Text style={[styles.sub, { color: colors.muted }]}>Use Save question in Practice or a Mock Exam to build a focused review set.</Text></View>}
          renderItem={({ item }) => <View style={[styles.bookmarkCard, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={[styles.category, { color: colors.primary }]}>{item.cat.toUpperCase()}</Text><Text style={[styles.question, { color: colors.foreground }]}>{item.q}</Text><View style={styles.bookmarkActions}><Pressable onPress={() => { haptic.light(); router.push({ pathname: "/bookmark-review", params: { id: item.id } }); }} accessibilityRole="button" style={({ pressed }) => [styles.reviewButton, { backgroundColor: colors.primary }, pressed && styles.pressed]}><Text style={[styles.reviewText, { color: colors.background }]}>Review</Text></Pressable><Pressable onPress={() => removeBookmark(item.id)} accessibilityRole="button" accessibilityLabel={`Remove ${item.q} from bookmarks`} style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}><Text style={[styles.remove, { color: colors.muted }]}>Remove</Text></Pressable></View></View>}
        />
      </ScreenContainer>
    );
  }

  const tools: StudyTool[] = [
    { id: "voice", label: "VOICE", title: "Voice Tutor", description: "Ask a focused Nursing question by voice or text.", accent: "01" },
    { id: "updates", label: "SOURCES", title: "Research Updates", description: "Check a Nursing topic against trusted connected sources.", accent: "02" },
    { id: "oral", label: "PRACTISE", title: "Oral Exam", description: "Answer aloud and receive focused follow-up questions.", accent: "03" },
    { id: "adaptive", label: "REVIEW", title: "Adaptive Review", description: adaptiveItems.length ? `${adaptiveItems.length} unique questions are prioritised for you.` : "Build a personalised queue from misses and saved items.", accent: "04" },
    { id: "bookmarks", label: "SAVED", title: "Bookmarks", description: savedQuestions.length ? `${savedQuestions.length} saved questions are ready for review.` : "Return to questions you save during a study round.", accent: "05" },
  ];

  return (
    <ScreenContainer className="px-5" edges={["top", "left", "right"]}>
      <FlatList
        data={tools}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.homeList}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<View style={styles.homeHeader}><View style={styles.headerRow}><View style={styles.headerCopy}><Text style={[styles.eyebrow, { color: colors.primary }]}>STUDY SPACE</Text><Text style={[styles.title, { color: colors.foreground }]}>Pick up where you left off.</Text></View><Pressable onPress={() => { haptic.light(); router.push("/settings" as never); }} accessibilityRole="button" accessibilityLabel="Open settings" style={({ pressed }) => [styles.settingsButton, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}><Text style={[styles.settingsGlyph, { color: colors.primary }]}>•••</Text></Pressable></View><Text style={[styles.sub, { color: colors.muted }]}>Short, focused tools built for a mobile study session.</Text><Pressable onPress={() => { haptic.medium(); router.push("/mock-exam" as never); }} accessibilityRole="button" style={({ pressed }) => [styles.mockCard, { backgroundColor: colors.primary }, pressed && styles.pressed]}><View><Text style={[styles.mockLabel, { color: colors.background }]}>TIMED SIMULATION</Text><Text style={[styles.mockTitle, { color: colors.background }]}>Mock Exam</Text><Text style={[styles.mockBody, { color: colors.background }]}>25 questions · 60 minutes · study simulation</Text></View><Text style={[styles.mockArrow, { color: colors.background }]}>›</Text></Pressable><Text style={[styles.sectionLabel, { color: colors.muted }]}>LEARNING TOOLS</Text></View>}
        renderItem={({ item }) => <Pressable onPress={() => openTool(item.id)} accessibilityRole="button" accessibilityLabel={`Open ${item.title}`} style={({ pressed }) => [styles.toolRow, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}><View style={[styles.toolMarker, { backgroundColor: colors.background, borderColor: colors.border }]}><Text style={[styles.toolMarkerText, { color: colors.primary }]}>{item.accent}</Text></View><View style={styles.toolCopy}><Text style={[styles.toolLabel, { color: colors.primary }]}>{item.label}</Text><Text style={[styles.toolTitle, { color: colors.foreground }]}>{item.title}</Text><Text style={[styles.toolBody, { color: colors.muted }]}>{item.description}</Text></View><Text style={[styles.rowChevron, { color: colors.primary }]}>›</Text></Pressable>}
        ListFooterComponent={<Text style={[styles.note, { color: colors.muted }]}>Priority review uses missed, partial, flagged, then saved items. Mock Exam is a timed study simulation, not an official NCLEX administration.</Text>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  homeList: { paddingTop: 18, paddingBottom: 34, gap: 10 },
  homeHeader: { gap: 14, marginBottom: 4 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 16 },
  headerCopy: { flex: 1, gap: 5 },
  eyebrow: { fontSize: 11, letterSpacing: 1.8, fontWeight: "900" },
  title: { fontFamily: "Georgia", fontSize: 29, lineHeight: 36, fontWeight: "700" },
  sub: { fontSize: 14, lineHeight: 20 },
  settingsButton: { width: 42, height: 42, borderWidth: 1, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  settingsGlyph: { fontSize: 16, lineHeight: 16, letterSpacing: 1.5, fontWeight: "900", marginTop: -5 },
  mockCard: { minHeight: 104, borderRadius: 24, padding: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  mockLabel: { fontSize: 10, letterSpacing: 1.4, fontWeight: "900", opacity: 0.82 },
  mockTitle: { fontFamily: "Georgia", fontSize: 25, lineHeight: 31, fontWeight: "700", marginTop: 3 },
  mockBody: { fontSize: 12, fontWeight: "700", marginTop: 2, opacity: 0.86 },
  mockArrow: { fontSize: 36, fontWeight: "300", marginTop: -2 },
  sectionLabel: { fontSize: 10, letterSpacing: 1.5, fontWeight: "900", marginTop: 2 },
  toolRow: { minHeight: 92, borderWidth: 1, borderRadius: 20, padding: 14, flexDirection: "row", alignItems: "center", gap: 12 },
  toolMarker: { width: 36, height: 36, borderWidth: 1, borderRadius: 12, alignItems: "center", justifyContent: "center", alignSelf: "flex-start", marginTop: 2 },
  toolMarkerText: { fontSize: 10, fontWeight: "900" },
  toolCopy: { flex: 1, gap: 2 },
  toolLabel: { fontSize: 9, letterSpacing: 1.1, fontWeight: "900" },
  toolTitle: { fontSize: 16, fontWeight: "900" },
  toolBody: { fontSize: 12, lineHeight: 17 },
  rowChevron: { fontSize: 28, fontWeight: "300", marginLeft: 1 },
  note: { fontSize: 11, lineHeight: 16, paddingHorizontal: 3, paddingTop: 7 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
  list: { paddingTop: 18, paddingBottom: 34, gap: 10 },
  listHeader: { gap: 8, marginBottom: 8 },
  backButton: { alignSelf: "flex-start", minHeight: 36, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, justifyContent: "center", marginBottom: 7 },
  backText: { fontSize: 13, fontWeight: "900" },
  empty: { borderWidth: 1, borderRadius: 20, padding: 18, gap: 6, marginTop: 12 },
  emptyTitle: { fontSize: 17, fontWeight: "900" },
  bookmarkCard: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 8 },
  category: { fontSize: 10, letterSpacing: 1.2, fontWeight: "900" },
  question: { fontSize: 16, lineHeight: 23, fontWeight: "700" },
  bookmarkActions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 5 },
  reviewButton: { minHeight: 40, borderRadius: 13, paddingHorizontal: 15, justifyContent: "center" },
  reviewText: { fontSize: 13, fontWeight: "900" },
  removeButton: { minHeight: 40, justifyContent: "center", paddingHorizontal: 4 },
  remove: { fontSize: 13, fontWeight: "800" },
});

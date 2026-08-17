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

  if (view === "bookmarks") {
    return (
      <ScreenContainer className="px-5" edges={["top", "left", "right"]}>
        <FlatList
          data={savedQuestions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={<View style={styles.header}><Pressable onPress={() => setView("home")} accessibilityRole="button"><Text style={[styles.back, { color: colors.primary }]}>‹ Study tools</Text></Pressable><Text style={[styles.eyebrow, { color: colors.primary }]}>SAVED QUESTIONS</Text><Text style={[styles.title, { color: colors.foreground }]}>Bookmarks</Text><Text style={[styles.sub, { color: colors.muted }]}>{savedQuestions.length ? `${savedQuestions.length} questions saved for review.` : "Save questions during practice to revisit them here."}</Text></View>}
          ListEmptyComponent={<View style={[styles.empty, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={[styles.emptyTitle, { color: colors.foreground }]}>No saved questions yet</Text><Text style={[styles.sub, { color: colors.muted }]}>Use Save question on a practice or mock-exam item to build a focused review list.</Text></View>}
          renderItem={({ item }) => <View style={[styles.bookmarkCard, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={[styles.category, { color: colors.primary }]}>{item.cat.toUpperCase()}</Text><Text style={[styles.question, { color: colors.foreground }]}>{item.q}</Text><View style={styles.row}><Pressable onPress={() => router.push({ pathname: "/bookmark-review", params: { id: item.id } })} accessibilityRole="button" style={[styles.reviewButton, { backgroundColor: colors.primary }]}><Text style={[styles.reviewText, { color: colors.background }]}>Review</Text></Pressable><Pressable onPress={() => removeBookmark(item.id)} accessibilityRole="button" accessibilityLabel={`Remove ${item.q} from bookmarks`}><Text style={[styles.remove, { color: colors.muted }]}>Remove</Text></Pressable></View></View>}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="px-5" edges={["top", "left", "right"]}>
      <View style={styles.home}><View style={styles.header}><Text style={[styles.eyebrow, { color: colors.primary }]}>STUDY TOOLS</Text><Text style={[styles.title, { color: colors.foreground }]}>Prepare with purpose.</Text><Text style={[styles.sub, { color: colors.muted }]}>Simulate a timed exam or return to questions that deserve another pass.</Text></View><Pressable onPress={() => router.push("/oral-exam")} accessibilityRole="button" style={({ pressed }) => [styles.toolCard, { borderColor: colors.primary, backgroundColor: colors.surface }, pressed && styles.pressed]}><Text style={[styles.toolOverline, { color: colors.primary }]}>HANDS-FREE PRACTICE</Text><Text style={[styles.toolTitle, { color: colors.foreground }]}>Oral Exam</Text><Text style={[styles.toolBody, { color: colors.muted }]}>Name or select a Nursing topic, answer aloud, and receive focused follow-up questions.</Text><Text style={[styles.toolAction, { color: colors.primary }]}>Start oral practice ›</Text></Pressable><Pressable onPress={() => router.push("/adaptive-review")} accessibilityRole="button" style={({ pressed }) => [styles.toolCard, { borderColor: colors.primary, backgroundColor: colors.surface }, pressed && styles.pressed]}><Text style={[styles.toolOverline, { color: colors.primary }]}>PERSONALIZED PRACTICE</Text><Text style={[styles.toolTitle, { color: colors.foreground }]}>Adaptive Review</Text><Text style={[styles.toolBody, { color: colors.muted }]}>{adaptiveItems.length ? `${adaptiveItems.length} unique questions prioritized from misses, partial answers, flags, and saved items.` : "Your adaptive queue will build from missed, partial, flagged, and saved questions."}</Text><Text style={[styles.toolAction, { color: colors.primary }]}>Review priorities ›</Text></Pressable><Pressable onPress={() => router.push("/mock-exam")} accessibilityRole="button" style={({ pressed }) => [styles.toolCard, { borderColor: colors.primary, backgroundColor: colors.primary }, pressed && styles.pressed]}><Text style={[styles.toolOverline, { color: colors.background }]}>TIMED SIMULATION</Text><Text style={[styles.toolTitle, { color: colors.background }]}>Mock Exam</Text><Text style={[styles.toolBody, { color: colors.background }]}>Take 25 randomized questions in a 60-minute NCLEX-style study session.</Text><Text style={[styles.toolAction, { color: colors.background }]}>Start exam ›</Text></Pressable><Pressable onPress={() => { haptic.light(); setView("bookmarks"); }} accessibilityRole="button" style={({ pressed }) => [styles.toolCard, { borderColor: colors.border, backgroundColor: colors.surface }, pressed && styles.pressed]}><Text style={[styles.toolOverline, { color: colors.primary }]}>REVISIT & REVIEW</Text><Text style={[styles.toolTitle, { color: colors.foreground }]}>Bookmarks</Text><Text style={[styles.toolBody, { color: colors.muted }]}>{savedQuestions.length ? `${savedQuestions.length} saved questions ready for focused review.` : "Save questions from Practice or Mock Exam to return to them later."}</Text><Text style={[styles.toolAction, { color: colors.primary }]}>Open bookmarks ›</Text></Pressable><Text style={[styles.note, { color: colors.muted }]}>Priority order: missed, partial, flagged, then saved. Mock Exam is a timed study simulation and not an official NCLEX administration.</Text></View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ home: { paddingTop: 18, gap: 16 }, header: { gap: 5 }, eyebrow: { fontSize: 12, letterSpacing: 2.2, fontWeight: "800" }, title: { fontFamily: "Georgia", fontSize: 30, fontWeight: "700", marginTop: 3 }, sub: { fontSize: 14, lineHeight: 20 }, toolCard: { borderWidth: 1, borderRadius: 24, padding: 20, gap: 8 }, toolOverline: { fontSize: 11, fontWeight: "900", letterSpacing: 1.4 }, toolTitle: { fontFamily: "Georgia", fontSize: 25, fontWeight: "700" }, toolBody: { fontSize: 14, lineHeight: 20 }, toolAction: { fontSize: 14, fontWeight: "900", marginTop: 5 }, note: { fontSize: 12, lineHeight: 17, paddingHorizontal: 2 }, pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] }, list: { paddingTop: 18, paddingBottom: 30, gap: 12 }, back: { fontSize: 14, fontWeight: "800", marginBottom: 14 }, empty: { borderWidth: 1, borderRadius: 20, padding: 18, gap: 6, marginTop: 22 }, emptyTitle: { fontSize: 17, fontWeight: "800" }, bookmarkCard: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 8 }, category: { fontSize: 10, letterSpacing: 1.2, fontWeight: "900" }, question: { fontSize: 16, lineHeight: 23, fontWeight: "700" }, row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 }, reviewButton: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 9 }, reviewText: { fontSize: 13, fontWeight: "900" }, remove: { fontSize: 13, fontWeight: "800" } });

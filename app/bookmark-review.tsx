import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { questionBank } from "@/data/questionBank";
import { BOOKMARKS_KEY, parseBookmarks, toggleBookmark } from "@/lib/bookmarks";
import { haptic } from "@/lib/haptics";
import { useColors } from "@/hooks/use-colors";

export default function BookmarkReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useColors();
  const question = questionBank.find((item) => item.id === id);
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(BOOKMARKS_KEY).then((value) => setSaved(parseBookmarks(value).some((bookmark) => bookmark.questionId === id)));
  }, [id]);

  if (!question) return <ScreenContainer className="p-5"><Text style={{ color: colors.foreground }}>This saved question is unavailable.</Text></ScreenContainer>;

  const toggleSaved = async () => {
    const current = parseBookmarks(await AsyncStorage.getItem(BOOKMARKS_KEY));
    const next = toggleBookmark(current, question.id);
    await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next));
    setSaved(next.some((bookmark) => bookmark.questionId === question.id));
    haptic.light();
  };

  return <ScreenContainer className="px-5" edges={["top", "left", "right"]}><ScrollView contentContainerStyle={styles.content}><Pressable onPress={() => router.back()} accessibilityRole="button"><Text style={[styles.back, { color: colors.primary }]}>‹ Back to bookmarks</Text></Pressable><Text style={[styles.eyebrow, { color: colors.primary }]}>{question.cat.toUpperCase()}</Text><Text style={[styles.title, { color: colors.foreground }]}>Saved review</Text><View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={[styles.question, { color: colors.foreground }]}>{question.q}</Text><Text style={[styles.label, { color: colors.primary }]}>ANSWER</Text><Text style={[styles.answer, { color: colors.foreground }]}>{question.a}</Text><Text style={[styles.label, { color: colors.primary }]}>WHY IT MATTERS</Text><Text style={[styles.body, { color: colors.muted }]}>{question.clinicalSignificance}</Text></View><Pressable onPress={() => void toggleSaved()} accessibilityRole="button" style={[styles.saveButton, { borderColor: colors.border }]}><Text style={[styles.saveText, { color: colors.muted }]}>{saved ? "Remove bookmark" : "Save question"}</Text></Pressable></ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { paddingTop: 18, paddingBottom: 36, gap: 14 }, back: { fontSize: 14, fontWeight: "800" }, eyebrow: { fontSize: 11, letterSpacing: 1.6, fontWeight: "900", marginTop: 4 }, title: { fontFamily: "Georgia", fontSize: 30, fontWeight: "700" }, card: { borderWidth: 1, borderRadius: 22, padding: 18, gap: 12 }, question: { fontFamily: "Georgia", fontSize: 22, lineHeight: 30, fontWeight: "700" }, label: { fontSize: 10, letterSpacing: 1.2, fontWeight: "900", marginTop: 2 }, answer: { fontSize: 16, lineHeight: 24, fontWeight: "700" }, body: { fontSize: 14, lineHeight: 21 }, saveButton: { minHeight: 48, borderWidth: 1, borderRadius: 16, justifyContent: "center", alignItems: "center" }, saveText: { fontSize: 14, fontWeight: "900" } });

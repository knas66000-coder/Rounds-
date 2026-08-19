import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { loadCompletedCaseReflections, type CompletedCaseReflection } from "@/lib/case-chain-store";
import { caseChainForId } from "@/shared/case-chains";

export default function CaseReflectionsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [reflections, setReflections] = useState<CompletedCaseReflection[]>([]);

  useEffect(() => {
    void loadCompletedCaseReflections().then(setReflections);
  }, []);

  return <ScreenContainer className="px-5" edges={["top", "left", "right"]}><ScrollView contentContainerStyle={styles.content}><Pressable onPress={() => router.back()} accessibilityRole="button"><Text style={[styles.back, { color: colors.primary }]}>‹ Case chain</Text></Pressable><Text style={[styles.eyebrow, { color: colors.primary }]}>PRIVATE ON THIS DEVICE</Text><Text style={[styles.title, { color: colors.foreground }]}>Case reflections</Text><Text style={[styles.copy, { color: colors.muted }]}>These reflection notes are visible only in your local Rounds app. They are not shared with Owner Control or institutional staff.</Text>{reflections.length ? reflections.map((reflection) => { const chain = caseChainForId(reflection.chainId); return <View key={reflection.chainId} style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={[styles.caseTitle, { color: colors.foreground }]}>{chain?.title ?? "Learning case"}</Text><Text style={[styles.date, { color: colors.muted }]}>{new Date(reflection.completedAt).toLocaleDateString()}</Text><Text style={[styles.reflection, { color: colors.foreground }]}>{reflection.reflection}</Text></View>; }) : <View style={[styles.empty, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={[styles.caseTitle, { color: colors.foreground }]}>No completed case reflections yet.</Text><Text style={[styles.copy, { color: colors.muted }]}>Finish a multi-step learning case and save its private reflection to see it here.</Text></View>}</ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { paddingTop: 19, paddingBottom: 40, gap: 12 }, back: { fontSize: 14, fontWeight: "900" }, eyebrow: { fontSize: 10, letterSpacing: 1.4, fontWeight: "900" }, title: { fontFamily: "Georgia", fontSize: 29, lineHeight: 37, fontWeight: "700" }, copy: { fontSize: 14, lineHeight: 21 }, card: { borderWidth: 1, borderRadius: 19, padding: 16, gap: 6 }, caseTitle: { fontSize: 16, fontWeight: "900" }, date: { fontSize: 11 }, reflection: { fontSize: 14, lineHeight: 21, marginTop: 3 }, empty: { borderWidth: 1, borderRadius: 19, padding: 16, gap: 6 } });

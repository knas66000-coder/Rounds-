import { useState } from "react";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { haptic } from "@/lib/haptics";
import { trpc } from "@/lib/trpc";
import { researchTopicProblem, type ResearchUpdate } from "@/shared/research-updates";

const TOPICS = ["Infection prevention", "Medication safety", "Nursing regulation", "Public health", "Patient safety"];

export default function ResearchUpdatesScreen() {
  const colors = useColors();
  const router = useRouter();
  const profile = trpc.academicProfile.get.useQuery();
  const search = trpc.researchUpdates.search.useMutation();
  const [topic, setTopic] = useState(TOPICS[0]);
  const [result, setResult] = useState<ResearchUpdate | null>(null);

  const runSearch = async () => {
    const problem = researchTopicProblem(topic);
    if (problem) { Alert.alert("Choose a study topic", problem); return; }
    haptic.medium();
    setResult(null);
    try {
      setResult(await search.mutateAsync({ topic }));
    } catch (error) {
      Alert.alert("Research Update unavailable", error instanceof Error ? error.message : "Try again when your connection is available.");
    }
  };

  const nursingAccess = profile.data?.program === "nursing";
  return (
    <ScreenContainer className="px-5" edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}><Pressable onPress={() => { haptic.light(); router.back(); }} accessibilityRole="button" style={({ pressed }) => [styles.backButton, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}><Text style={[styles.backText, { color: colors.primary }]}>‹</Text></Pressable><View style={[styles.connectedPill, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={[styles.connectionDot, { backgroundColor: colors.success }]} /><Text style={[styles.connectedText, { color: colors.muted }]}>CONNECTED</Text></View></View>
        <View style={styles.header}><Text style={[styles.eyebrow, { color: colors.primary }]}>NURSING SOURCES</Text><Text style={[styles.title, { color: colors.foreground }]}>Research updates</Text><Text style={[styles.sub, { color: colors.muted }]}>Search approved public guidance when you choose to connect. Your installed course pack remains your primary study resource.</Text></View>
        {!nursingAccess ? <View style={[styles.notice, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={[styles.noticeTitle, { color: colors.foreground }]}>Nursing updates are the first release.</Text><Text style={[styles.noticeText, { color: colors.muted }]}>This connected feature will be mapped to approved sources for your program when its course pack is available. Your current learning pack is still available offline.</Text></View> : <><View style={[styles.searchSheet, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={[styles.sheetLabel, { color: colors.primary }]}>WHAT DO YOU WANT TO CHECK?</Text><TextInput value={topic} onChangeText={setTopic} placeholder="For example, infection prevention" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]} maxLength={160} returnKeyType="search" onSubmitEditing={() => void runSearch()} accessibilityLabel="Nursing research topic" /><View style={styles.chips}>{TOPICS.map((item) => <Pressable key={item} onPress={() => { haptic.light(); setTopic(item); }} accessibilityRole="button" accessibilityState={{ selected: topic === item }} style={({ pressed }) => [styles.chip, { borderColor: topic === item ? colors.primary : colors.border, backgroundColor: topic === item ? colors.primary : colors.background }, pressed && styles.pressed]}><Text style={{ color: topic === item ? colors.background : colors.foreground, fontSize: 11, fontWeight: "800" }}>{item}</Text></Pressable>)}</View><Pressable onPress={() => void runSearch()} disabled={search.isPending} accessibilityRole="button" style={({ pressed }) => [styles.searchButton, { backgroundColor: colors.primary }, pressed && styles.pressed, search.isPending && styles.disabled]}><Text style={[styles.searchButtonText, { color: colors.background }]}>{search.isPending ? "Checking approved sources…" : "Check official sources"}</Text><Text style={[styles.searchButtonArrow, { color: colors.background }]}>›</Text></Pressable></View><View style={styles.connectionNote}><View style={[styles.noteDot, { backgroundColor: colors.primary }]} /><Text style={[styles.connectionNoteText, { color: colors.muted }]}>Search runs only when you tap the button and requires a connection. Sources are limited to NCSBN, CDC, FDA, WHO, and NIH.</Text></View>{result ? <View style={[styles.resultSheet, { borderColor: colors.primary, backgroundColor: colors.surface }]}><Text style={[styles.resultLabel, { color: colors.primary }]}>CITED UPDATE</Text><Text style={[styles.resultTitle, { color: colors.foreground }]}>{result.headline}</Text><Text style={[styles.resultSummary, { color: colors.foreground }]}>{result.summary}</Text><View style={[styles.sourceGroup, { borderTopColor: colors.border }]}><Text style={[styles.sourceHeading, { color: colors.muted }]}>OFFICIAL SOURCES</Text>{result.sources.map((source) => <Pressable key={source.url} onPress={() => { haptic.light(); void Linking.openURL(source.url); }} accessibilityRole="link" accessibilityLabel={`Open source: ${source.title}`} style={({ pressed }) => [styles.sourceRow, { backgroundColor: colors.background, borderColor: colors.border }, pressed && styles.pressed]}><Text numberOfLines={2} style={[styles.sourceLink, { color: colors.primary }]}>{source.title}</Text><Text style={[styles.sourceArrow, { color: colors.primary }]}>↗</Text></Pressable>)}</View><Text style={[styles.safety, { color: colors.muted }]}>{result.safetyNote}</Text></View> : null}</>}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 16, paddingBottom: 34, gap: 15 },
  topBar: { height: 39, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backButton: { width: 38, height: 38, borderWidth: 1, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  backText: { fontSize: 26, lineHeight: 30, fontWeight: "300", marginTop: -2 },
  connectedPill: { height: 31, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", gap: 6 },
  connectionDot: { width: 6, height: 6, borderRadius: 99 },
  connectedText: { fontSize: 9, letterSpacing: 1, fontWeight: "900" },
  header: { gap: 5 },
  eyebrow: { fontSize: 10, letterSpacing: 1.6, fontWeight: "900" },
  title: { fontFamily: "Georgia", fontSize: 30, lineHeight: 37, fontWeight: "700" },
  sub: { fontSize: 13, lineHeight: 19 },
  searchSheet: { borderWidth: 1, borderRadius: 23, padding: 15, gap: 11 },
  sheetLabel: { fontSize: 9, letterSpacing: 1.2, fontWeight: "900" },
  input: { minHeight: 51, borderWidth: 1, borderRadius: 16, paddingHorizontal: 14, fontSize: 15 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 8 },
  searchButton: { minHeight: 51, borderRadius: 16, paddingHorizontal: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  searchButtonText: { fontSize: 14, fontWeight: "900" },
  searchButtonArrow: { fontSize: 27, fontWeight: "300" },
  connectionNote: { flexDirection: "row", gap: 8, alignItems: "flex-start", paddingHorizontal: 3 },
  noteDot: { width: 6, height: 6, borderRadius: 99, marginTop: 6 },
  connectionNoteText: { flex: 1, fontSize: 11, lineHeight: 16 },
  resultSheet: { borderWidth: 1.5, borderRadius: 23, padding: 16, gap: 8 },
  resultLabel: { fontSize: 9, letterSpacing: 1.2, fontWeight: "900" },
  resultTitle: { fontFamily: "Georgia", fontSize: 22, lineHeight: 29, fontWeight: "700" },
  resultSummary: { fontSize: 14, lineHeight: 21 },
  sourceGroup: { borderTopWidth: 1, marginTop: 3, paddingTop: 10, gap: 7 },
  sourceHeading: { fontSize: 9, letterSpacing: 1.2, fontWeight: "900" },
  sourceRow: { minHeight: 45, borderWidth: 1, borderRadius: 13, paddingHorizontal: 11, flexDirection: "row", alignItems: "center", gap: 8 },
  sourceLink: { flex: 1, fontSize: 12, lineHeight: 17, fontWeight: "800" },
  sourceArrow: { fontSize: 18, fontWeight: "900" },
  safety: { fontSize: 11, lineHeight: 16, marginTop: 2 },
  notice: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 6 },
  noticeTitle: { fontSize: 16, fontWeight: "900" },
  noticeText: { fontSize: 13, lineHeight: 19 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.65 },
});

import { useState } from "react";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { researchTopicProblem, type ResearchUpdate } from "@/shared/research-updates";

const TOPICS = ["Infection prevention", "Medication safety", "Nursing regulation", "Public health", "Patient safety"];

export default function ResearchUpdatesScreen() {
  const colors = useColors();
  const profile = trpc.academicProfile.get.useQuery();
  const search = trpc.researchUpdates.search.useMutation();
  const [topic, setTopic] = useState(TOPICS[0]);
  const [result, setResult] = useState<ResearchUpdate | null>(null);

  const runSearch = async () => {
    const problem = researchTopicProblem(topic);
    if (problem) {
      Alert.alert("Choose a study topic", problem);
      return;
    }
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
        <View style={styles.header}><Text style={[styles.eyebrow, { color: colors.primary }]}>CONNECTED NURSING SOURCES</Text><Text style={[styles.title, { color: colors.foreground }]}>Research Updates</Text><Text style={[styles.sub, { color: colors.muted }]}>Check an academic topic against current public guidance from approved official sources. Your installed Rounds course pack remains the primary study resource.</Text></View>
        {!nursingAccess ? <View style={[styles.notice, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={[styles.noticeTitle, { color: colors.foreground }]}>Nursing updates are the first release.</Text><Text style={[styles.noticeText, { color: colors.muted }]}>Research Updates will be mapped to the approved sources for your program when its course pack is available. Your current pack remains available offline.</Text></View> : <><View style={[styles.searchCard, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={[styles.label, { color: colors.foreground }]}>Nursing or public-health topic</Text><TextInput value={topic} onChangeText={setTopic} placeholder="For example, infection prevention" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, borderColor: colors.border }]} maxLength={160} returnKeyType="search" onSubmitEditing={() => void runSearch()} accessibilityLabel="Nursing research topic" /><View style={styles.chips}>{TOPICS.map((item) => <Pressable key={item} onPress={() => setTopic(item)} accessibilityRole="button" style={({ pressed }) => [styles.chip, { borderColor: topic === item ? colors.primary : colors.border, backgroundColor: topic === item ? colors.primary : colors.background }, pressed && styles.pressed]}><Text style={{ color: topic === item ? colors.background : colors.foreground, fontSize: 12, fontWeight: "800" }}>{item}</Text></Pressable>)}</View><Pressable onPress={() => void runSearch()} disabled={search.isPending} accessibilityRole="button" style={({ pressed }) => [styles.searchButton, { backgroundColor: colors.primary }, pressed && styles.pressed, search.isPending && styles.disabled]}><Text style={[styles.searchButtonText, { color: colors.background }]}>{search.isPending ? "Checking approved sources…" : "Check for research updates"}</Text></Pressable></View><View style={[styles.boundary, { borderColor: colors.border }]}><Text style={[styles.boundaryTitle, { color: colors.foreground }]}>Connected by choice</Text><Text style={[styles.boundaryText, { color: colors.muted }]}>This search needs data and runs only when you tap the button. Results are limited to NCSBN, CDC, FDA, WHO, and NIH sources. It does not replace your course rationale, local policy, or clinical judgment.</Text></View>{result ? <View style={[styles.resultCard, { borderColor: colors.primary, backgroundColor: colors.surface }]}><Text style={[styles.resultLabel, { color: colors.primary }]}>CITED RESEARCH UPDATE</Text><Text style={[styles.resultTitle, { color: colors.foreground }]}>{result.headline}</Text><Text style={[styles.resultSummary, { color: colors.foreground }]}>{result.summary}</Text><View style={[styles.sourceGroup, { borderTopColor: colors.border }]}><Text style={[styles.sourceHeading, { color: colors.foreground }]}>Official sources</Text>{result.sources.map((source) => <Pressable key={source.url} onPress={() => void Linking.openURL(source.url)} accessibilityRole="link" accessibilityLabel={`Open source: ${source.title}`}><Text style={[styles.sourceLink, { color: colors.primary }]}>{source.title} ↗</Text></Pressable>)}</View><Text style={[styles.safety, { color: colors.muted }]}>{result.safetyNote}</Text></View> : null}</>}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 20, paddingBottom: 40, gap: 17 }, header: { gap: 7 }, eyebrow: { fontSize: 11, letterSpacing: 1.6, fontWeight: "900" }, title: { fontFamily: "Georgia", fontSize: 31, lineHeight: 39, fontWeight: "700" }, sub: { fontSize: 14, lineHeight: 21 }, searchCard: { borderWidth: 1, borderRadius: 22, padding: 17, gap: 12 }, label: { fontSize: 14, fontWeight: "900" }, input: { minHeight: 48, borderWidth: 1, borderRadius: 14, paddingHorizontal: 13, fontSize: 15 }, chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 8 }, searchButton: { minHeight: 52, borderRadius: 16, alignItems: "center", justifyContent: "center", marginTop: 2 }, searchButtonText: { fontSize: 15, fontWeight: "900" }, boundary: { borderWidth: 1, borderRadius: 18, padding: 15, gap: 4 }, boundaryTitle: { fontSize: 15, fontWeight: "900" }, boundaryText: { fontSize: 13, lineHeight: 19 }, resultCard: { borderWidth: 1.5, borderRadius: 22, padding: 18, gap: 8 }, resultLabel: { fontSize: 10, letterSpacing: 1.3, fontWeight: "900" }, resultTitle: { fontFamily: "Georgia", fontSize: 23, lineHeight: 30, fontWeight: "700" }, resultSummary: { fontSize: 14, lineHeight: 21 }, sourceGroup: { borderTopWidth: 1, marginTop: 4, paddingTop: 11, gap: 7 }, sourceHeading: { fontSize: 13, fontWeight: "900" }, sourceLink: { fontSize: 13, lineHeight: 19, fontWeight: "800" }, safety: { fontSize: 12, lineHeight: 18, marginTop: 3 }, notice: { borderWidth: 1, borderRadius: 20, padding: 17, gap: 6 }, noticeTitle: { fontSize: 17, fontWeight: "900" }, noticeText: { fontSize: 14, lineHeight: 21 }, pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] }, disabled: { opacity: 0.65 },
});

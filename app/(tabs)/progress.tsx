import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import type { Category } from "@/data/questionBank";

const STORAGE_KEY = "rounds.session.v1";
type SavedResult = { verdict: "correct" | "partial" | "incorrect"; category: Category; at: string };

export default function ProgressScreen() {
  const colors = useColors();
  const [results, setResults] = useState<SavedResult[]>([]);
  useFocusEffect(useCallback(() => { AsyncStorage.getItem(STORAGE_KEY).then((value) => setResults(value ? JSON.parse(value) : [])); }, []));
  const correct = results.filter((r) => r.verdict === "correct").length;
  const partial = results.filter((r) => r.verdict === "partial").length;
  const incorrect = results.filter((r) => r.verdict === "incorrect").length;
  const accuracy = results.length ? Math.round((correct / results.length) * 100) : 0;
  return <ScreenContainer className="px-5" edges={["top", "left", "right"]}><View style={styles.header}><Text style={[styles.eyebrow, { color: colors.primary }]}>YOUR PRACTICE</Text><Text style={[styles.title, { color: colors.foreground }]}>Progress that teaches.</Text><Text style={[styles.sub, { color: colors.muted }]}>Your results stay on this device.</Text></View><View style={[styles.hero, { backgroundColor: colors.primary }]}><Text style={styles.heroLabel}>OVERALL ACCURACY</Text><Text style={styles.heroNumber}>{accuracy}%</Text><Text style={styles.heroSub}>{results.length ? `${results.length} questions reviewed` : "Complete a question to start tracking"}</Text></View><Text style={[styles.section, { color: colors.muted }]}>VERDICT BREAKDOWN</Text><View style={styles.grid}><Metric label="Correct" value={correct} color={colors.success} background={colors.surface} /><Metric label="Partial" value={partial} color={colors.warning} background={colors.surface} /><Metric label="Missed" value={incorrect} color={colors.error} background={colors.surface} /></View><View style={[styles.note, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={[styles.noteTitle, { color: colors.foreground }]}>Study tip</Text><Text style={[styles.noteText, { color: colors.muted }]}>Review partial answers first. They show where you already have a foundation and need one or two more clinical details.</Text></View></ScreenContainer>;
}
function Metric({ label, value, color, background }: { label: string; value: number; color: string; background: string }) { return <View style={[styles.metric, { backgroundColor: background }]}><Text style={[styles.metricValue, { color }]}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>; }
const styles = StyleSheet.create({ header: { paddingTop: 18, gap: 5 }, eyebrow: { fontSize: 12, letterSpacing: 2.2, fontWeight: "800" }, title: { fontFamily: "Georgia", fontSize: 30, fontWeight: "700", marginTop: 3 }, sub: { fontSize: 14, lineHeight: 20 }, hero: { marginTop: 24, borderRadius: 24, padding: 22, gap: 6 }, heroLabel: { color: "#F5F1E8", fontSize: 11, fontWeight: "800", letterSpacing: 1.5 }, heroNumber: { color: "#F5F1E8", fontSize: 54, lineHeight: 62, fontWeight: "800" }, heroSub: { color: "#DDE9E1", fontSize: 13 }, section: { fontSize: 11, letterSpacing: 1.4, fontWeight: "800", marginTop: 24, marginBottom: 10 }, grid: { flexDirection: "row", gap: 10 }, metric: { flex: 1, borderRadius: 18, padding: 15, gap: 4 }, metricValue: { fontSize: 28, fontWeight: "800" }, metricLabel: { color: "#687076", fontSize: 12, fontWeight: "700" }, note: { marginTop: 18, borderWidth: 1, borderRadius: 18, padding: 16, gap: 7 }, noteTitle: { fontSize: 16, fontWeight: "800" }, noteText: { fontSize: 14, lineHeight: 21 } });

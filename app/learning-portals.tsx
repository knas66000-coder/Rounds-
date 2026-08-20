import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { haptic } from "@/lib/haptics";
import { useLocalLearningProfile } from "@/lib/local-learning-profile";
import { portalForProgram } from "@/shared/academic-profile";

export default function LearningPortalsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { profile } = useLocalLearningProfile();
  const activePortal = profile ? portalForProgram(profile.program) : null;
  return <ScreenContainer className="px-5" edges={["top", "left", "right"]}>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}><Text style={[styles.eyebrow, { color: colors.primary }]}>ROUNDS LEARNING PORTALS</Text><Text style={[styles.title, { color: colors.foreground }]}>Choose your study space.</Text><Text style={[styles.sub, { color: colors.muted }]}>University and High School learning are intentionally separate. Select a portal first, then explore only the packs designed for that learning level.</Text></View>
      <PortalCard accent="#4D5B8C" eyebrow="UNIVERSITY PORTAL" title="University learning" description="Nursing, Foundation Year, Computing, Business, Engineering, Natural Sciences, Education, and Social Sciences." status={activePortal === "university" ? `${profile?.institutionName} · current private path` : "Separate university course packs"} action="Enter University portal" colors={colors} onPress={() => { haptic.medium(); router.push("/university-portal" as never); }} />
      <PortalCard accent="#8A6540" eyebrow="HIGH SCHOOL PORTAL" title="Uganda High School" description="Senior 1–6 subject packs, varied local topic sessions, saved review, milestones, and private study rhythm." status={activePortal === "high_school" ? `${profile?.institutionName} · current private path` : "Separate high-school subject packs"} action="Enter High School portal" colors={colors} onPress={() => { haptic.medium(); router.push("/high-school-portal" as never); }} />
      <View style={[styles.note, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={[styles.noteTitle, { color: colors.foreground }]}>No mixed library</Text><Text style={[styles.noteText, { color: colors.muted }]}>Nursing remains inside the University portal. High-school learners see only high-school subjects inside their portal. Your private program selection stays on this device unless you later choose Community.</Text></View>
    </ScrollView>
  </ScreenContainer>;
}

function PortalCard({ accent, eyebrow, title, description, status, action, colors, onPress }: { accent: string; eyebrow: string; title: string; description: string; status: string; action: string; colors: ReturnType<typeof useColors>; onPress: () => void }) {
  return <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={action} style={({ pressed }) => [styles.portalCard, { borderColor: accent, backgroundColor: colors.surface }, pressed && styles.pressed]}><View style={[styles.portalMark, { backgroundColor: accent }]}><Text style={[styles.portalMarkText, { color: colors.background }]}>{title === "University learning" ? "U" : "S"}</Text></View><Text style={[styles.cardEyebrow, { color: accent }]}>{eyebrow}</Text><Text style={[styles.cardTitle, { color: colors.foreground }]}>{title}</Text><Text style={[styles.cardDescription, { color: colors.muted }]}>{description}</Text><Text style={[styles.status, { color: accent }]}>{status}</Text><View style={styles.actionRow}><Text style={[styles.action, { color: accent }]}>{action}</Text><Text style={[styles.chevron, { color: accent }]}>›</Text></View></Pressable>;
}

const styles = StyleSheet.create({ content: { paddingTop: 21, paddingBottom: 38, gap: 14 }, header: { gap: 7, marginBottom: 2 }, eyebrow: { fontSize: 10, letterSpacing: 1.6, fontWeight: "900" }, title: { fontFamily: "Georgia", fontSize: 31, lineHeight: 39, fontWeight: "700" }, sub: { fontSize: 14, lineHeight: 21 }, portalCard: { borderWidth: 1.5, borderRadius: 24, padding: 18, gap: 7 }, portalMark: { width: 43, height: 43, borderRadius: 15, alignItems: "center", justifyContent: "center", marginBottom: 2 }, portalMarkText: { fontFamily: "Georgia", fontSize: 23, fontWeight: "700" }, cardEyebrow: { fontSize: 9, letterSpacing: 1.3, fontWeight: "900" }, cardTitle: { fontFamily: "Georgia", fontSize: 24, lineHeight: 30, fontWeight: "700" }, cardDescription: { fontSize: 13, lineHeight: 19 }, status: { fontSize: 10, lineHeight: 15, fontWeight: "900", marginTop: 2 }, actionRow: { minHeight: 35, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 }, action: { fontSize: 14, fontWeight: "900" }, chevron: { fontSize: 28, fontWeight: "300" }, note: { borderWidth: 1, borderRadius: 19, padding: 15, gap: 5 }, noteTitle: { fontSize: 15, fontWeight: "900" }, noteText: { fontSize: 12, lineHeight: 18 }, pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] } });

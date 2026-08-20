import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { haptic } from "@/lib/haptics";
import { useLocalLearningProfile } from "@/lib/local-learning-profile";
import { isUgandaHighSchoolProgram, programPackFor } from "@/shared/academic-profile";
import { highSchoolCoursePacks } from "@/shared/course-packs";

export default function HighSchoolPortalScreen() {
  const colors = useColors();
  const router = useRouter();
  const { profile } = useLocalLearningProfile();
  const hasHighSchoolProfile = Boolean(profile && isUgandaHighSchoolProgram(profile.program));
  const currentSubject = hasHighSchoolProfile && profile ? programPackFor(profile.program) : null;
  const packs = highSchoolCoursePacks();
  return <ScreenContainer className="px-5" edges={["top", "left", "right"]}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <Pressable onPress={() => router.back()} accessibilityRole="button"><Text style={[styles.back, { color: colors.primary }]}>‹ Learning portals</Text></Pressable>
    <View style={styles.header}><Text style={[styles.eyebrow, { color: "#8A6540" }]}>HIGH SCHOOL PORTAL</Text><Text style={[styles.title, { color: colors.foreground }]}>Uganda High School.</Text><Text style={[styles.sub, { color: colors.muted }]}>A dedicated Senior 1–6 space for subject packs, varied local topics, and private learning rhythm.</Text></View>
    <View style={[styles.hero, { backgroundColor: "#8A6540" }]}><Text style={[styles.heroLabel, { color: colors.background }]}>{packs.length} HIGH-SCHOOL SUBJECTS</Text><Text style={[styles.heroTitle, { color: colors.background }]}>One school library, no university courses.</Text><Text style={[styles.heroText, { color: colors.background }]}>Choose a high-school subject, set your Senior level, study varied topics, and retain private progress on this device.</Text></View>
    <View style={[styles.profileCard, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={[styles.eyebrow, { color: colors.primary }]}>YOUR HIGH-SCHOOL PATH</Text><Text style={[styles.profileTitle, { color: colors.foreground }]}>{currentSubject ? currentSubject.title.replace("High School ", "") : "Choose a high-school subject"}</Text><Text style={[styles.profileText, { color: colors.muted }]}>{currentSubject && profile ? `${profile.institutionName} · ${currentSubject.packTitle}` : "Choose a school and one starting subject when you are ready. Senior level and topic scope remain private on this device."}</Text>{hasHighSchoolProfile ? <PortalButton colors={colors} accent="#8A6540" label="Open my High School home" onPress={() => { haptic.light(); router.push("/high-school-home" as never); }} /> : <PortalButton colors={colors} accent="#8A6540" label="Set High School subject" onPress={() => { haptic.light(); router.push({ pathname: "/academic-onboarding", params: { portal: "high_school" } } as never); }} />}</View>
    <PortalButton colors={colors} accent="#8A6540" label="Browse High School subjects" onPress={() => { haptic.medium(); router.push({ pathname: "/course-packs", params: { portal: "high_school" } } as never); }} />
    <View style={[styles.note, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={[styles.noteTitle, { color: colors.foreground }]}>High-school-only learning</Text><Text style={[styles.noteText, { color: colors.muted }]}>This portal never lists university programs or Nursing. Use the separate University portal to access university packs.</Text></View>
  </ScrollView></ScreenContainer>;
}

function PortalButton({ colors, accent, label, onPress }: { colors: ReturnType<typeof useColors>; accent: string; label: string; onPress: () => void }) { return <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.actionButton, { backgroundColor: accent }, pressed && styles.pressed]}><Text style={[styles.actionText, { color: colors.background }]}>{label}</Text><Text style={[styles.actionArrow, { color: colors.background }]}>›</Text></Pressable>; }
const styles = StyleSheet.create({ content: { paddingTop: 18, paddingBottom: 38, gap: 14 }, back: { fontSize: 14, fontWeight: "900" }, header: { gap: 5 }, eyebrow: { fontSize: 10, letterSpacing: 1.4, fontWeight: "900" }, title: { fontFamily: "Georgia", fontSize: 30, lineHeight: 37, fontWeight: "700" }, sub: { fontSize: 13, lineHeight: 19 }, hero: { borderRadius: 24, padding: 19, gap: 6 }, heroLabel: { fontSize: 9, letterSpacing: 1.2, fontWeight: "900", opacity: 0.82 }, heroTitle: { fontFamily: "Georgia", fontSize: 23, lineHeight: 30, fontWeight: "700" }, heroText: { fontSize: 12, lineHeight: 18, opacity: 0.9 }, profileCard: { borderWidth: 1, borderRadius: 20, padding: 15, gap: 6 }, profileTitle: { fontSize: 17, fontWeight: "900" }, profileText: { fontSize: 12, lineHeight: 18 }, actionButton: { minHeight: 53, borderRadius: 17, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, actionText: { fontSize: 14, fontWeight: "900" }, actionArrow: { fontSize: 29, fontWeight: "300" }, note: { borderWidth: 1, borderRadius: 18, padding: 15, gap: 5 }, noteTitle: { fontSize: 14, fontWeight: "900" }, noteText: { fontSize: 12, lineHeight: 18 }, pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] } });

import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { haptic } from "@/lib/haptics";
import { useLocalLearningProfile } from "@/lib/local-learning-profile";
import { isUniversityProgram, programPackFor } from "@/shared/academic-profile";
import { universityCoursePacks } from "@/shared/course-packs";

export default function UniversityPortalScreen() {
  const colors = useColors();
  const router = useRouter();
  const { profile } = useLocalLearningProfile();
  const hasUniversityProfile = Boolean(profile && isUniversityProgram(profile.program));
  const currentProgram = hasUniversityProfile && profile ? programPackFor(profile.program) : null;
  const packs = universityCoursePacks();
  return <ScreenContainer className="px-5" edges={["top", "left", "right"]}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <Pressable onPress={() => router.back()} accessibilityRole="button"><Text style={[styles.back, { color: colors.primary }]}>‹ Learning portals</Text></Pressable>
    <View style={styles.header}><Text style={[styles.eyebrow, { color: "#4D5B8C" }]}>UNIVERSITY PORTAL</Text><Text style={[styles.title, { color: colors.foreground }]}>University learning.</Text><Text style={[styles.sub, { color: colors.muted }]}>A dedicated space for university packs. Nursing is a University program and remains here.</Text></View>
    <View style={[styles.hero, { backgroundColor: "#4D5B8C" }]}><Text style={[styles.heroLabel, { color: colors.background }]}>{packs.length} UNIVERSITY PACKS</Text><Text style={[styles.heroTitle, { color: colors.background }]}>One university library, no high-school subjects.</Text><Text style={[styles.heroText, { color: colors.background }]}>Explore Nursing, Foundation Year, Computing, Business, Engineering, Natural Sciences, Education, and Social Sciences as distinct university paths.</Text></View>
    <View style={[styles.profileCard, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={[styles.eyebrow, { color: colors.primary }]}>YOUR UNIVERSITY PATH</Text><Text style={[styles.profileTitle, { color: colors.foreground }]}>{currentProgram ? currentProgram.title : "Choose a university program"}</Text><Text style={[styles.profileText, { color: colors.muted }]}>{currentProgram && profile ? `${profile.institutionName} · ${currentProgram.packTitle}` : "Choose a university or college and a program when you are ready. This is stored privately on your device."}</Text>{hasUniversityProfile ? <PortalButton colors={colors} accent="#4D5B8C" label="Open my University home" onPress={() => { haptic.light(); router.push("/academic-home" as never); }} /> : <PortalButton colors={colors} accent="#4D5B8C" label="Set University program" onPress={() => { haptic.light(); router.push({ pathname: "/academic-onboarding", params: { portal: "university" } } as never); }} />}</View>
    <PortalButton colors={colors} accent="#4D5B8C" label="Browse University course packs" onPress={() => { haptic.medium(); router.push({ pathname: "/course-packs", params: { portal: "university" } } as never); }} />
    <View style={[styles.note, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={[styles.noteTitle, { color: colors.foreground }]}>University-only learning</Text><Text style={[styles.noteText, { color: colors.muted }]}>This portal never lists Uganda High School subjects. Use the separate High School portal to access Senior 1–6 subject packs.</Text></View>
  </ScrollView></ScreenContainer>;
}

function PortalButton({ colors, accent, label, onPress }: { colors: ReturnType<typeof useColors>; accent: string; label: string; onPress: () => void }) { return <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.actionButton, { backgroundColor: accent }, pressed && styles.pressed]}><Text style={[styles.actionText, { color: colors.background }]}>{label}</Text><Text style={[styles.actionArrow, { color: colors.background }]}>›</Text></Pressable>; }
const styles = StyleSheet.create({ content: { paddingTop: 18, paddingBottom: 38, gap: 14 }, back: { fontSize: 14, fontWeight: "900" }, header: { gap: 5 }, eyebrow: { fontSize: 10, letterSpacing: 1.4, fontWeight: "900" }, title: { fontFamily: "Georgia", fontSize: 30, lineHeight: 37, fontWeight: "700" }, sub: { fontSize: 13, lineHeight: 19 }, hero: { borderRadius: 24, padding: 19, gap: 6 }, heroLabel: { fontSize: 9, letterSpacing: 1.2, fontWeight: "900", opacity: 0.82 }, heroTitle: { fontFamily: "Georgia", fontSize: 23, lineHeight: 30, fontWeight: "700" }, heroText: { fontSize: 12, lineHeight: 18, opacity: 0.9 }, profileCard: { borderWidth: 1, borderRadius: 20, padding: 15, gap: 6 }, profileTitle: { fontSize: 17, fontWeight: "900" }, profileText: { fontSize: 12, lineHeight: 18 }, actionButton: { minHeight: 53, borderRadius: 17, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, actionText: { fontSize: 14, fontWeight: "900" }, actionArrow: { fontSize: 29, fontWeight: "300" }, note: { borderWidth: 1, borderRadius: 18, padding: 15, gap: 5 }, noteTitle: { fontSize: 14, fontWeight: "900" }, noteText: { fontSize: 12, lineHeight: 18 }, pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] } });

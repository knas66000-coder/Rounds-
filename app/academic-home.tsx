import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { isAcademicProgram, programPackFor } from "@/shared/academic-profile";
import { primaryCoursePackForProgram } from "@/shared/course-packs";

export default function AcademicHomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const profileQuery = trpc.academicProfile.get.useQuery();
  const profile = profileQuery.data;
  if (!profile || !isAcademicProgram(profile.program)) return null;
  const pack = programPackFor(profile.program);
  const nursing = pack.id === "nursing";
  const primaryCoursePack = primaryCoursePackForProgram(profile.program);
  const beginSharedRound = () => {
    if (!primaryCoursePack) return;
    if (primaryCoursePack.id === "nursing-practice") { router.replace("/" as never); return; }
    router.push({ pathname: "/course-round", params: { packId: primaryCoursePack.id } } as never);
  };

  return (
    <ScreenContainer className="px-5" edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}><Text style={[styles.eyebrow, { color: colors.primary }]}>{pack.faculty.toUpperCase()}</Text><Text style={[styles.title, { color: colors.foreground }]}>{pack.title} at {profile.institutionName}</Text><Text style={[styles.sub, { color: colors.muted }]}>This is your private Rounds study home. Your selected program determines the pack and learning path you see.</Text></View>
        <View style={[styles.packCard, { borderColor: colors.primary, backgroundColor: colors.surface }]}><Text style={[styles.packLabel, { color: colors.primary }]}>YOUR PROGRAM PACK</Text><Text style={[styles.packTitle, { color: colors.foreground }]}>{pack.packTitle}</Text><Text style={[styles.packText, { color: colors.muted }]}>{pack.description}</Text><Text style={[styles.packStatus, { color: colors.success }]}>{nursing ? "INSTALLED AND READY" : "ACTIVE STARTER PACK READY"}</Text></View>
        <Pressable onPress={() => router.push("/course-packs" as never)} accessibilityRole="button" style={[styles.coursePacksButton, { borderColor: colors.primary, backgroundColor: colors.surface }]}><Text style={[styles.coursePacksLabel, { color: colors.primary }]}>COURSE PACKS</Text><Text style={[styles.coursePacksTitle, { color: colors.foreground }]}>Explore your subject learning library</Text><Text style={[styles.coursePacksText, { color: colors.muted }]}>Shared Rounds architecture, with different course formats for writing, cases, calculations, evidence, or technical problem-solving.</Text></Pressable>
        <View style={styles.actions}><Pressable onPress={beginSharedRound} style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.primary }, pressed && styles.pressed]} accessibilityRole="button"><Text style={[styles.primaryText, { color: colors.background }]}>Start learning round</Text></Pressable>{nursing ? <View style={styles.secondaryRow}><Pressable onPress={() => router.push("/categories")} style={[styles.secondaryButton, { borderColor: colors.border, backgroundColor: colors.surface }]} accessibilityRole="button"><Text style={[styles.secondaryText, { color: colors.foreground }]}>Choose topic</Text></Pressable><Pressable onPress={() => router.push("/oral-exam")} style={[styles.secondaryButton, { borderColor: colors.border, backgroundColor: colors.surface }]} accessibilityRole="button"><Text style={[styles.secondaryText, { color: colors.foreground }]}>Start Oral Exam</Text></Pressable></View> : <View style={[styles.activeCard, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={[styles.pendingTitle, { color: colors.foreground }]}>Your subject round is ready.</Text><Text style={[styles.pendingText, { color: colors.muted }]}>Complete each activity once, save any activity for review, and start a fresh local round when you finish.</Text></View>}<Pressable onPress={() => nursing ? router.push("/bookmark-review") : primaryCoursePack && router.push({ pathname: "/course-round", params: { packId: primaryCoursePack.id, review: "1" } } as never)} accessibilityRole="button"><Text style={[styles.link, { color: colors.primary }]}>Review saved activities ›</Text></Pressable>{nursing ? <Pressable onPress={() => router.push("/mock-exam")} accessibilityRole="button"><Text style={[styles.link, { color: colors.primary }]}>Open Nursing mock exam ›</Text></Pressable> : null}</View>
        <Pressable onPress={() => router.push("/academic-onboarding")} accessibilityRole="button" style={[styles.profileButton, { borderColor: colors.border }]}><Text style={[styles.profileButtonText, { color: colors.foreground }]}>Change university or program</Text></Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 20, paddingBottom: 40, gap: 17 }, header: { gap: 7 }, eyebrow: { fontSize: 11, letterSpacing: 1.6, fontWeight: "900" }, title: { fontFamily: "Georgia", fontSize: 30, lineHeight: 38, fontWeight: "700" }, sub: { fontSize: 14, lineHeight: 21 }, packCard: { borderWidth: 1.5, borderRadius: 23, padding: 19, gap: 7 }, packLabel: { fontSize: 10, letterSpacing: 1.3, fontWeight: "900" }, packTitle: { fontFamily: "Georgia", fontSize: 24, fontWeight: "700" }, packText: { fontSize: 14, lineHeight: 20 }, packStatus: { fontSize: 10, letterSpacing: 1, fontWeight: "900", marginTop: 4 }, coursePacksButton: { borderWidth: 1, borderRadius: 20, padding: 17, gap: 5 }, coursePacksLabel: { fontSize: 10, letterSpacing: 1.3, fontWeight: "900" }, coursePacksTitle: { fontSize: 17, fontWeight: "900" }, coursePacksText: { fontSize: 13, lineHeight: 19 }, actions: { gap: 10 }, primaryButton: { minHeight: 54, borderRadius: 17, alignItems: "center", justifyContent: "center" }, primaryText: { fontSize: 15, fontWeight: "900" }, secondaryRow: { flexDirection: "row", gap: 9 }, secondaryButton: { minHeight: 48, flex: 1, borderWidth: 1, borderRadius: 15, justifyContent: "center", alignItems: "center", paddingHorizontal: 8 }, secondaryText: { fontSize: 13, fontWeight: "900", textAlign: "center" }, link: { textAlign: "center", fontSize: 13, fontWeight: "900", marginTop: 2 }, activeCard: { borderWidth: 1, borderRadius: 20, padding: 17, gap: 6 }, pendingTitle: { fontSize: 17, fontWeight: "900" }, pendingText: { fontSize: 14, lineHeight: 21 }, profileButton: { minHeight: 48, borderWidth: 1, borderRadius: 15, alignItems: "center", justifyContent: "center" }, profileButtonText: { fontSize: 14, fontWeight: "900" }, pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
});

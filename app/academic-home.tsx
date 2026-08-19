import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Redirect, useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { haptic } from "@/lib/haptics";
import { isPackInstalled, loadCoursePackInstalls, type CoursePackInstall } from "@/lib/course-pack-store";
import { trpc } from "@/lib/trpc";
import { isAcademicProgram, isUgandaHighSchoolProgram, programPackFor } from "@/shared/academic-profile";
import { primaryCoursePackForProgram } from "@/shared/course-packs";

export default function AcademicHomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const profileQuery = trpc.academicProfile.get.useQuery();
  const profile = profileQuery.data;
  const [installs, setInstalls] = useState<CoursePackInstall[]>([]);
  const [installsReady, setInstallsReady] = useState(false);

  useEffect(() => {
    void loadCoursePackInstalls().then((next) => { setInstalls(next); setInstallsReady(true); });
  }, []);

  if (!profile || !isAcademicProgram(profile.program)) return null;
  if (isUgandaHighSchoolProgram(profile.program)) return <Redirect href="/high-school-home" />;

  const pack = programPackFor(profile.program);
  const nursing = pack.id === "nursing";
  const highSchool = false;
  const primaryCoursePack = primaryCoursePackForProgram(profile.program);
  const requiresLocalInstall = primaryCoursePack?.delivery === "downloadable";
  const packInstalled = !requiresLocalInstall || Boolean(primaryCoursePack && isPackInstalled(primaryCoursePack, installs));
  const beginSharedRound = () => {
    haptic.medium();
    if (!primaryCoursePack) return;
    if (primaryCoursePack.id === "nursing-practice") { router.replace("/" as never); return; }
    if (requiresLocalInstall && !packInstalled) { router.push("/course-packs" as never); return; }
    router.push({ pathname: "/course-round", params: { packId: primaryCoursePack.id } } as never);
  };
  const reviewSaved = () => {
    haptic.light();
    if (nursing) router.push("/bookmark-review" as never);
    else if (primaryCoursePack) router.push({ pathname: "/course-round", params: { packId: primaryCoursePack.id, review: "1" } } as never);
  };
  const primaryActionLabel = requiresLocalInstall && !packInstalled ? "Add pack for offline study" : "Start learning round";

  return (
    <ScreenContainer className="px-5" edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}><Text style={[styles.eyebrow, { color: colors.primary }]}>{pack.faculty.toUpperCase()}</Text><Text style={[styles.title, { color: colors.foreground }]}>{pack.title}</Text><Text style={[styles.institution, { color: colors.muted }]}>{profile.institutionName}</Text></View>

        <View style={[styles.programCard, { backgroundColor: colors.primary }]}><Text style={[styles.programLabel, { color: colors.background }]}>{highSchool ? "UGANDA HIGH SCHOOL PATH" : "YOUR LEARNING PATH"}</Text><Text style={[styles.programTitle, { color: colors.background }]}>{pack.packTitle}</Text><Text style={[styles.programText, { color: colors.background }]}>{pack.description}</Text><View style={[styles.readyPill, { backgroundColor: colors.background }]}><Text style={[styles.readyText, { color: colors.primary }]}>{nursing ? "READY TO PRACTISE" : requiresLocalInstall && !packInstalled ? "ADD FOR OFFLINE USE" : highSchool ? "SUBJECT PACK READY" : "STARTER PACK READY"}</Text></View></View>

        <View style={styles.actionGroup}><Text style={[styles.sectionLabel, { color: colors.muted }]}>CONTINUE LEARNING</Text><Pressable onPress={beginSharedRound} disabled={requiresLocalInstall && !installsReady} style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.primary, opacity: requiresLocalInstall && !installsReady ? 0.55 : 1 }, pressed && styles.pressed]} accessibilityRole="button"><Text style={[styles.primaryText, { color: colors.background }]}>{requiresLocalInstall && !installsReady ? "Checking local packs…" : primaryActionLabel}</Text><Text style={[styles.primaryArrow, { color: colors.background }]}>›</Text></Pressable><View style={styles.secondaryRow}><Pressable onPress={() => { haptic.light(); router.push("/course-packs" as never); }} style={({ pressed }) => [styles.smallAction, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]} accessibilityRole="button"><Text style={[styles.smallActionLabel, { color: colors.primary }]}>LIBRARY</Text><Text style={[styles.smallActionText, { color: colors.foreground }]}>{requiresLocalInstall && !packInstalled ? "Add offline pack" : "Course packs"}</Text></Pressable><Pressable onPress={reviewSaved} style={({ pressed }) => [styles.smallAction, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]} accessibilityRole="button"><Text style={[styles.smallActionLabel, { color: colors.primary }]}>REVIEW</Text><Text style={[styles.smallActionText, { color: colors.foreground }]}>Saved activities</Text></Pressable></View></View>

        {nursing ? <View style={[styles.nursingRow, { borderColor: colors.border, backgroundColor: colors.surface }]}><View><Text style={[styles.nursingLabel, { color: colors.primary }]}>NURSING TOOLS</Text><Text style={[styles.nursingText, { color: colors.foreground }]}>Choose a topic or begin an oral exam.</Text></View><Pressable onPress={() => { haptic.light(); router.push("/oral-exam" as never); }} accessibilityRole="button" style={({ pressed }) => [styles.oralButton, { borderColor: colors.primary }, pressed && styles.pressed]}><Text style={[styles.oralButtonText, { color: colors.primary }]}>Oral Exam</Text></Pressable></View> : <View style={[styles.infoRow, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={[styles.infoTitle, { color: colors.foreground }]}>{highSchool ? "Original, subject-specific starter learning" : "Designed for your subject"}</Text><Text style={[styles.infoText, { color: colors.muted }]}>{highSchool ? "This active local pack uses original reviewed activities, a no-repeat learning round, saved review, and a private multi-step case. It is not an official NCDC syllabus or examination service." : "Your installed pack includes distinct activities, cases, and saved-review support while using the same Rounds learning structure."}</Text></View>}

        <Pressable onPress={() => { haptic.light(); router.push("/academic-onboarding" as never); }} accessibilityRole="button" style={({ pressed }) => [styles.profileButton, pressed && styles.pressed]}><Text style={[styles.profileButtonText, { color: colors.muted }]}>Change school, university, or subject</Text><Text style={[styles.profileChevron, { color: colors.muted }]}>›</Text></Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 18, paddingBottom: 34, gap: 18 }, header: { gap: 4 }, eyebrow: { fontSize: 10, letterSpacing: 1.7, fontWeight: "900" }, title: { fontFamily: "Georgia", fontSize: 30, lineHeight: 37, fontWeight: "700" }, institution: { fontSize: 14, fontWeight: "700" }, programCard: { borderRadius: 25, padding: 19, gap: 7 }, programLabel: { fontSize: 10, letterSpacing: 1.4, fontWeight: "900", opacity: 0.82 }, programTitle: { fontFamily: "Georgia", fontSize: 25, lineHeight: 31, fontWeight: "700" }, programText: { fontSize: 13, lineHeight: 19, opacity: 0.9 }, readyPill: { alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7, marginTop: 5 }, readyText: { fontSize: 9, letterSpacing: 1, fontWeight: "900" }, actionGroup: { gap: 9 }, sectionLabel: { fontSize: 10, letterSpacing: 1.5, fontWeight: "900" }, primaryButton: { minHeight: 56, borderRadius: 18, paddingHorizontal: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, primaryText: { fontSize: 16, fontWeight: "900" }, primaryArrow: { fontSize: 29, fontWeight: "300" }, secondaryRow: { flexDirection: "row", gap: 10 }, smallAction: { minHeight: 79, flex: 1, borderWidth: 1, borderRadius: 18, padding: 13, justifyContent: "center", gap: 4 }, smallActionLabel: { fontSize: 9, letterSpacing: 1.1, fontWeight: "900" }, smallActionText: { fontSize: 14, lineHeight: 18, fontWeight: "900" }, nursingRow: { borderWidth: 1, borderRadius: 20, padding: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }, nursingLabel: { fontSize: 9, letterSpacing: 1.2, fontWeight: "900" }, nursingText: { fontSize: 13, lineHeight: 18, fontWeight: "800", marginTop: 3, maxWidth: 195 }, oralButton: { borderWidth: 1, borderRadius: 13, minHeight: 38, paddingHorizontal: 12, justifyContent: "center" }, oralButtonText: { fontSize: 12, fontWeight: "900" }, infoRow: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 5 }, infoTitle: { fontSize: 15, fontWeight: "900" }, infoText: { fontSize: 13, lineHeight: 19 }, profileButton: { minHeight: 47, paddingHorizontal: 4, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, profileButtonText: { fontSize: 13, fontWeight: "800" }, profileChevron: { fontSize: 26, fontWeight: "300" }, pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
});

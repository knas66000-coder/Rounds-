import { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { canInstallPack, installLocalCoursePack, isPackInstalled, loadCoursePackInstalls, loadCoursePackResume, saveCoursePackResume, type CoursePackInstall, type CoursePackResume } from "@/lib/course-pack-store";
import { trpc } from "@/lib/trpc";
import { isAcademicProgram } from "@/shared/academic-profile";
import { courseActivityLabel, coursePackReadinessLabel, coursePacksForProgram, type CoursePack } from "@/shared/course-packs";
import { starterActivityFor } from "@/shared/course-pack-activities";
import { caseChainForPack } from "@/shared/case-chains";

const packAccents: Record<string, string> = {
  "nursing-practice": "#2F5D4E",
  "university-foundation-year": "#685A93",
  "computing-foundations": "#355F7C",
  "business-foundations": "#805A3D",
  "engineering-foundations": "#4C6F6B",
  "natural-sciences-foundations": "#477159",
  "education-foundations": "#816A3E",
  "social-sciences-foundations": "#83596B",
};

export default function CoursePacksScreen() {
  const colors = useColors();
  const router = useRouter();
  const profileQuery = trpc.academicProfile.get.useQuery();
  const profile = profileQuery.data;
  const [installs, setInstalls] = useState<CoursePackInstall[]>([]);
  const [resume, setResume] = useState<CoursePackResume | null>(null);
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);

  const packs = useMemo(() => profile && isAcademicProgram(profile.program) ? coursePacksForProgram(profile.program) : [], [profile]);
  const selectedPack = packs.find((pack) => pack.id === selectedPackId) ?? packs[0] ?? null;

  useEffect(() => {
    void Promise.all([loadCoursePackInstalls(), loadCoursePackResume()]).then(([nextInstalls, nextResume]) => {
      setInstalls(nextInstalls);
      setResume(nextResume);
    });
  }, []);

  const openCourse = async (pack: CoursePack, courseId: string) => {
    if (pack.id === "nursing-practice") {
      router.replace("/" as never);
      return;
    }
    if (!isPackInstalled(pack, installs)) {
      Alert.alert("Add for offline first", `Add ${pack.title} to this device before opening its local starter activities.`);
      return;
    }
    const nextResume = await saveCoursePackResume(pack.id, courseId);
    if (nextResume) setResume(nextResume);
    if (!starterActivityFor(pack.id, courseId)) {
      Alert.alert("Next activity in development", "This active pack is ready, but this course’s next reviewed activity has not been added yet. Rounds will not substitute Nursing questions or unreviewed material.");
      return;
    }
    router.push({ pathname: "/course-activity", params: { packId: pack.id, courseId } } as never);
  };
  const addForOffline = async (pack: CoursePack) => {
    const installed = await installLocalCoursePack(pack.id);
    if (!installed) { Alert.alert("Pack unavailable", "This pack is already on the device or is not ready for offline installation."); return; }
    setInstalls((current) => [...current.filter((item) => item.packId !== pack.id), installed]);
    Alert.alert("Ready offline", `${pack.title} is now available in your local Rounds library.`);
  };
  const startLearningRound = (pack: CoursePack) => {
    if (pack.id === "nursing-practice") { router.replace("/" as never); return; }
    if (!isPackInstalled(pack, installs)) { Alert.alert("Add for offline first", `Add ${pack.title} to this device before starting its local learning round.`); return; }
    router.push({ pathname: "/course-round", params: { packId: pack.id } } as never);
  };
  const openCaseChain = (pack: CoursePack) => {
    const chain = caseChainForPack(pack.id);
    if (!chain || pack.id === "nursing-practice") return;
    if (!isPackInstalled(pack, installs)) { Alert.alert("Add for offline first", `Add ${pack.title} to this device before opening its local learning case.`); return; }
    router.push({ pathname: "/case-chain", params: { chainId: chain.id } } as never);
  };

  if (!profile || !isAcademicProgram(profile.program)) return null;

  return (
    <ScreenContainer className="px-5" edges={["top", "left", "right"]}>
      <FlatList
        data={packs}
        keyExtractor={(pack) => pack.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<View style={styles.header}><Pressable onPress={() => router.back()} accessibilityRole="button"><Text style={[styles.back, { color: colors.primary }]}>‹ {profile.program.replace(/_/g, " ")}</Text></Pressable><Text style={[styles.eyebrow, { color: colors.primary }]}>YOUR LEARNING LIBRARY</Text><Text style={[styles.title, { color: colors.foreground }]}>Course packs for {profile.institutionName}</Text><Text style={[styles.sub, { color: colors.muted }]}>The learning engine is shared. The content, study method, and assessment style belong to each subject.</Text>{resume ? <Text style={[styles.resume, { color: colors.muted }]}>Resume saved locally · {resume.courseId.replace(/-/g, " ")}</Text> : null}{selectedPack ? <SelectedPack pack={selectedPack} installed={isPackInstalled(selectedPack, installs)} colors={colors} onOpenCourse={openCourse} onInstall={addForOffline} onStartRound={startLearningRound} onOpenCase={openCaseChain} /> : null}<Text style={[styles.sectionTitle, { color: colors.foreground }]}>Available for your program</Text></View>}
        renderItem={({ item }) => <PackCard pack={item} accent={packAccents[item.id] ?? colors.primary} selected={item.id === selectedPack?.id} installed={isPackInstalled(item, installs)} colors={colors} onPress={() => setSelectedPackId(item.id)} />}
        ListEmptyComponent={<View style={[styles.empty, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={[styles.emptyTitle, { color: colors.foreground }]}>Your pack list is being prepared.</Text><Text style={[styles.emptyText, { color: colors.muted }]}>Return to your program home or review your academic profile.</Text></View>}
      />
    </ScreenContainer>
  );
}

function SelectedPack({ pack, installed, colors, onOpenCourse, onInstall, onStartRound, onOpenCase }: { pack: CoursePack; installed: boolean; colors: ReturnType<typeof useColors>; onOpenCourse: (pack: CoursePack, courseId: string) => void; onInstall: (pack: CoursePack) => void; onStartRound: (pack: CoursePack) => void; onOpenCase: (pack: CoursePack) => void }) {
  const accent = packAccents[pack.id] ?? colors.primary;
  const chain = caseChainForPack(pack.id);
  return <View style={[styles.focusCard, { borderColor: accent, backgroundColor: colors.surface }]}><Text style={[styles.focusLabel, { color: accent }]}>{installed ? "READY ON THIS DEVICE" : coursePackReadinessLabel(pack.readiness)}</Text><Text style={[styles.focusTitle, { color: colors.foreground }]}>{pack.title}</Text><Text style={[styles.focusCopy, { color: colors.muted }]}>{pack.description}</Text>{canInstallPack(pack) && !installed ? <Pressable onPress={() => onInstall(pack)} accessibilityRole="button" style={[styles.installButton, { backgroundColor: accent }]}><Text style={[styles.installButtonText, { color: colors.background }]}>Add for offline · {pack.estimatedDownloadMb ?? 0} MB</Text></Pressable> : <Pressable onPress={() => onStartRound(pack)} accessibilityRole="button" style={[styles.installButton, { backgroundColor: accent }]}><Text style={[styles.installButtonText, { color: colors.background }]}>Start learning round</Text></Pressable>}{chain ? <Pressable onPress={() => onOpenCase(pack)} accessibilityRole="button" style={[styles.caseButton, { borderColor: accent }]}><Text style={[styles.caseButtonText, { color: accent }]}>Open multi-step learning case</Text></Pressable> : null}<FlatList horizontal data={pack.courses} keyExtractor={(course) => course.id} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.courseList} renderItem={({ item: course }) => <Pressable onPress={() => void onOpenCourse(pack, course.id)} accessibilityRole="button" style={({ pressed }) => [styles.courseCard, { borderColor: colors.border, backgroundColor: colors.background }, pressed && styles.pressed]}><Text style={[styles.courseTitle, { color: colors.foreground }]}>{course.title}</Text><Text numberOfLines={3} style={[styles.courseSummary, { color: colors.muted }]}>{course.summary}</Text><Text style={[styles.courseMode, { color: accent }]}>{course.activityKinds.map(courseActivityLabel).join(" · ")}</Text><Text style={[styles.courseAction, { color: accent }]}>{pack.id === "nursing-practice" ? "Open practice" : course.contentState === "active" ? (installed ? "Open activity detail" : "Add pack for offline") : "Next activity in development"}</Text></Pressable>} /></View>;
}

function PackCard({ pack, accent, selected, installed, colors, onPress }: { pack: CoursePack; accent: string; selected: boolean; installed: boolean; colors: ReturnType<typeof useColors>; onPress: () => void }) {
  return <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Open ${pack.title}`} style={({ pressed }) => [styles.packCard, { borderColor: selected ? accent : colors.border, backgroundColor: colors.surface }, pressed && styles.pressed]}><View style={[styles.accent, { backgroundColor: accent }]} /><View style={styles.packCopy}><View style={styles.packTop}><Text style={[styles.packFaculty, { color: accent }]}>{pack.faculty.toUpperCase()}</Text><Text style={[styles.packStatus, { color: pack.readiness === "active" ? colors.success : pack.readiness === "catalog" ? accent : colors.warning }]}>{installed ? "INSTALLED" : coursePackReadinessLabel(pack.readiness)}</Text></View><Text style={[styles.packTitle, { color: colors.foreground }]}>{pack.title}</Text><Text numberOfLines={2} style={[styles.packDescription, { color: colors.muted }]}>{pack.description}</Text><Text style={[styles.openLabel, { color: accent }]}>{selected ? "Viewing above" : "View course structure"}</Text></View></Pressable>;
}

const styles = StyleSheet.create({
  content: { paddingTop: 19, paddingBottom: 40, gap: 10 }, header: { gap: 8, marginBottom: 8 }, back: { fontSize: 14, fontWeight: "900", marginBottom: 4 }, eyebrow: { fontSize: 10, letterSpacing: 1.5, fontWeight: "900" }, title: { fontFamily: "Georgia", fontSize: 29, lineHeight: 36, fontWeight: "700" }, sub: { fontSize: 14, lineHeight: 21 }, resume: { fontSize: 12, textTransform: "capitalize", marginTop: 2 }, sectionTitle: { fontSize: 16, fontWeight: "900", marginTop: 9 }, focusCard: { marginTop: 9, borderWidth: 1.5, borderRadius: 22, padding: 17, gap: 7 }, focusLabel: { fontSize: 10, letterSpacing: 1.3, fontWeight: "900" }, focusTitle: { fontFamily: "Georgia", fontSize: 23, fontWeight: "700" }, focusCopy: { fontSize: 14, lineHeight: 20 }, installButton: { minHeight: 45, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 2 }, installButtonText: { fontSize: 13, fontWeight: "900" }, caseButton: { minHeight: 42, borderWidth: 1, borderRadius: 14, alignItems: "center", justifyContent: "center" }, caseButtonText: { fontSize: 13, fontWeight: "900" }, courseList: { gap: 10, paddingTop: 5, paddingBottom: 1 }, courseCard: { width: 214, minHeight: 190, borderWidth: 1, borderRadius: 16, padding: 13, gap: 6 }, courseTitle: { fontSize: 15, lineHeight: 20, fontWeight: "900" }, courseSummary: { fontSize: 12, lineHeight: 17, flex: 1 }, courseMode: { fontSize: 10, lineHeight: 15, fontWeight: "800" }, courseAction: { fontSize: 12, fontWeight: "900" }, packCard: { borderWidth: 1, borderRadius: 19, minHeight: 126, flexDirection: "row", overflow: "hidden" }, accent: { width: 6 }, packCopy: { flex: 1, padding: 14, gap: 4 }, packTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 }, packFaculty: { fontSize: 9, letterSpacing: 1.1, fontWeight: "900", flex: 1 }, packStatus: { fontSize: 9, letterSpacing: 0.8, fontWeight: "900" }, packTitle: { fontSize: 17, fontWeight: "900" }, packDescription: { fontSize: 12, lineHeight: 17 }, openLabel: { fontSize: 12, fontWeight: "900", marginTop: 2 }, empty: { borderWidth: 1, borderRadius: 18, padding: 17, gap: 5 }, emptyTitle: { fontSize: 16, fontWeight: "900" }, emptyText: { fontSize: 13, lineHeight: 19 }, pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
});

import { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { haptic } from "@/lib/haptics";
import { canInstallPack, installLocalCoursePack, isPackInstalled, loadCoursePackInstalls, loadCoursePackResume, saveCoursePackResume, type CoursePackInstall, type CoursePackResume } from "@/lib/course-pack-store";
import { trpc } from "@/lib/trpc";
import { isAcademicProgram, isUgandaHighSchoolProgram } from "@/shared/academic-profile";
import { courseActivityLabel, coursePackReadinessLabel, coursePacksForProgram, highSchoolCoursePacks, type CoursePack } from "@/shared/course-packs";
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
  "uganda-high-school-biology": "#39735D",
  "uganda-high-school-chemistry": "#5A5E9F",
  "uganda-high-school-economics": "#8B5E39",
  "uganda-high-school-entrepreneurship": "#986543",
  "uganda-high-school-english": "#6E527D",
  "uganda-high-school-physics": "#3D6D92",
  "uganda-high-school-mathematics": "#8C4C5F",
  "uganda-high-school-geography": "#547B69",
  "uganda-high-school-history-civics": "#7B6150",
  "uganda-high-school-ict": "#386D83",
  "uganda-high-school-agriculture": "#6B7D40",
  "uganda-high-school-religion-ethics": "#765A7C",
  "uganda-high-school-kiswahili": "#3B7181",
  "uganda-high-school-literature": "#8B5A72",
  "uganda-high-school-fine-art": "#A4673C",
  "uganda-high-school-technical-drawing": "#4B6787",
  "uganda-high-school-food-nutrition": "#9B7040",
  "uganda-high-school-music": "#6C5591",
  "uganda-high-school-physical-education": "#3F7A70",
};

export default function CoursePacksScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ focus?: string; level?: string }>();
  const profileQuery = trpc.academicProfile.get.useQuery();
  const profile = profileQuery.data;
  const [installs, setInstalls] = useState<CoursePackInstall[]>([]);
  const [resume, setResume] = useState<CoursePackResume | null>(null);
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);

  const packs = useMemo(() => profile && isAcademicProgram(profile.program) ? (isUgandaHighSchoolProgram(profile.program) ? highSchoolCoursePacks() : coursePacksForProgram(profile.program)) : [], [profile]);
  const selectedPack = packs.find((pack) => pack.id === selectedPackId) ?? packs[0] ?? null;

  useEffect(() => {
    void Promise.all([loadCoursePackInstalls(), loadCoursePackResume()]).then(([nextInstalls, nextResume]) => {
      setInstalls(nextInstalls);
      setResume(nextResume);
    });
  }, []);

  useEffect(() => {
    if (typeof params.focus === "string" && packs.some((pack) => pack.id === params.focus)) setSelectedPackId(params.focus);
  }, [packs, params.focus]);

  const openCourse = async (pack: CoursePack, courseId: string) => {
    haptic.light();
    if (pack.id === "nursing-practice") { router.replace("/" as never); return; }
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
    router.push({ pathname: "/course-activity", params: { packId: pack.id, courseId, ...(params.level ? { level: params.level } : {}) } } as never);
  };

  const addForOffline = async (pack: CoursePack) => {
    haptic.medium();
    const installed = await installLocalCoursePack(pack.id);
    if (!installed) { Alert.alert("Pack unavailable", "This pack is already on the device or is not ready for offline installation."); return; }
    setInstalls((current) => [...current.filter((item) => item.packId !== pack.id), installed]);
    Alert.alert("Ready offline", `${pack.title} is now available in your local Rounds library.`);
  };

  const startLearningRound = (pack: CoursePack) => {
    haptic.medium();
    if (pack.id === "nursing-practice") { router.replace("/" as never); return; }
    if (!isPackInstalled(pack, installs)) { Alert.alert("Add for offline first", `Add ${pack.title} to this device before starting its local learning round.`); return; }
    router.push({ pathname: "/course-round", params: { packId: pack.id, ...(params.level ? { level: params.level } : {}) } } as never);
  };

  const openCaseChain = (pack: CoursePack) => {
    const chain = caseChainForPack(pack.id);
    if (!chain || pack.id === "nursing-practice") return;
    haptic.light();
    if (!isPackInstalled(pack, installs)) { Alert.alert("Add for offline first", `Add ${pack.title} to this device before opening its local learning case.`); return; }
    router.push({ pathname: "/case-chain", params: { chainId: chain.id, ...(params.level ? { level: params.level } : {}) } } as never);
  };

  if (!profile || !isAcademicProgram(profile.program)) return null;

  return (
    <ScreenContainer className="px-5" edges={["top", "left", "right"]}>
      <FlatList
        data={packs}
        keyExtractor={(pack) => pack.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<View style={styles.header}><View style={styles.topBar}><Pressable onPress={() => { haptic.light(); router.back(); }} accessibilityRole="button" style={({ pressed }) => [styles.backButton, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}><Text style={[styles.backText, { color: colors.primary }]}>‹</Text></Pressable><Text style={[styles.topBarTitle, { color: colors.muted }]}>COURSE LIBRARY</Text><View style={styles.topBarSpacer} /></View><Text style={[styles.title, { color: colors.foreground }]}>Your learning packs</Text><Text style={[styles.sub, { color: colors.muted }]}>{profile.institutionName} · your study content is organised by subject and stored locally after installation.</Text>{resume ? <Text style={[styles.resume, { color: colors.muted }]}>Resume: {resume.courseId.replace(/-/g, " ")}</Text> : null}{selectedPack ? <SelectedPack pack={selectedPack} installed={isPackInstalled(selectedPack, installs)} colors={colors} onOpenCourse={openCourse} onInstall={addForOffline} onStartRound={startLearningRound} onOpenCase={openCaseChain} /> : null}<Text style={[styles.sectionTitle, { color: colors.muted }]}>YOUR AVAILABLE PACKS</Text></View>}
        renderItem={({ item }) => <PackCard pack={item} accent={packAccents[item.id] ?? colors.primary} selected={item.id === selectedPack?.id} installed={isPackInstalled(item, installs)} colors={colors} onPress={() => { haptic.light(); setSelectedPackId(item.id); }} />}
        ListEmptyComponent={<View style={[styles.empty, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={[styles.emptyTitle, { color: colors.foreground }]}>Your library is being prepared.</Text><Text style={[styles.emptyText, { color: colors.muted }]}>Return to your program home or review your academic profile.</Text></View>}
      />
    </ScreenContainer>
  );
}

function SelectedPack({ pack, installed, colors, onOpenCourse, onInstall, onStartRound, onOpenCase }: { pack: CoursePack; installed: boolean; colors: ReturnType<typeof useColors>; onOpenCourse: (pack: CoursePack, courseId: string) => void; onInstall: (pack: CoursePack) => void; onStartRound: (pack: CoursePack) => void; onOpenCase: (pack: CoursePack) => void }) {
  const accent = packAccents[pack.id] ?? colors.primary;
  const chain = caseChainForPack(pack.id);
  return <View style={[styles.focusSheet, { backgroundColor: colors.surface, borderColor: accent }]}><View style={styles.focusHeader}><View style={[styles.focusMark, { backgroundColor: accent }]}><Text style={[styles.focusMarkText, { color: colors.background }]}>{pack.title.slice(0, 1)}</Text></View><View style={styles.focusCopyWrap}><Text style={[styles.focusLabel, { color: accent }]}>{installed ? "READY ON THIS DEVICE" : coursePackReadinessLabel(pack.readiness)}</Text><Text style={[styles.focusTitle, { color: colors.foreground }]}>{pack.title}</Text></View></View><Text style={[styles.focusCopy, { color: colors.muted }]}>{pack.description}</Text>{canInstallPack(pack) && !installed ? <Pressable onPress={() => onInstall(pack)} accessibilityRole="button" style={({ pressed }) => [styles.primaryAction, { backgroundColor: accent }, pressed && styles.pressed]}><Text style={[styles.primaryActionText, { color: colors.background }]}>Download for offline · {pack.estimatedDownloadMb ?? 0} MB</Text><Text style={[styles.primaryActionArrow, { color: colors.background }]}>›</Text></Pressable> : <Pressable onPress={() => onStartRound(pack)} accessibilityRole="button" style={({ pressed }) => [styles.primaryAction, { backgroundColor: accent }, pressed && styles.pressed]}><Text style={[styles.primaryActionText, { color: colors.background }]}>Start learning round</Text><Text style={[styles.primaryActionArrow, { color: colors.background }]}>›</Text></Pressable>}{chain ? <Pressable onPress={() => onOpenCase(pack)} accessibilityRole="button" style={({ pressed }) => [styles.caseAction, { borderColor: accent }, pressed && styles.pressed]}><Text style={[styles.caseActionText, { color: accent }]}>Open multi-step learning case</Text><Text style={[styles.caseActionArrow, { color: accent }]}>›</Text></Pressable> : null}<Text style={[styles.courseSectionLabel, { color: colors.muted }]}>START FROM A COURSE</Text><FlatList horizontal data={pack.courses} keyExtractor={(course) => course.id} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.courseList} renderItem={({ item: course }) => <Pressable onPress={() => void onOpenCourse(pack, course.id)} accessibilityRole="button" style={({ pressed }) => [styles.courseCard, { borderColor: colors.border, backgroundColor: colors.background }, pressed && styles.pressed]}><Text numberOfLines={2} style={[styles.courseTitle, { color: colors.foreground }]}>{course.title}</Text><Text numberOfLines={3} style={[styles.courseSummary, { color: colors.muted }]}>{course.summary}</Text><Text numberOfLines={2} style={[styles.courseMode, { color: accent }]}>{course.activityKinds.map(courseActivityLabel).join(" · ")}</Text><Text style={[styles.courseAction, { color: accent }]}>{pack.id === "nursing-practice" ? "Open practice ›" : course.contentState === "active" ? (installed ? "Open activity ›" : "Install pack first") : "In development"}</Text></Pressable>} /></View>;
}

function PackCard({ pack, accent, selected, installed, colors, onPress }: { pack: CoursePack; accent: string; selected: boolean; installed: boolean; colors: ReturnType<typeof useColors>; onPress: () => void }) {
  return <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected }} accessibilityLabel={`Open ${pack.title}`} style={({ pressed }) => [styles.packRow, { borderColor: selected ? accent : colors.border, backgroundColor: colors.surface }, pressed && styles.pressed]}><View style={[styles.packDot, { backgroundColor: accent }]} /><View style={styles.packCopy}><View style={styles.packTop}><Text style={[styles.packFaculty, { color: accent }]}>{pack.faculty.toUpperCase()}</Text><Text style={[styles.packStatus, { color: pack.readiness === "active" ? colors.success : pack.readiness === "catalog" ? accent : colors.warning }]}>{installed ? "INSTALLED" : coursePackReadinessLabel(pack.readiness)}</Text></View><Text style={[styles.packTitle, { color: colors.foreground }]}>{pack.title}</Text><Text numberOfLines={1} style={[styles.packDescription, { color: colors.muted }]}>{pack.description}</Text></View><Text style={[styles.packChevron, { color: accent }]}>{selected ? "•" : "›"}</Text></Pressable>;
}

const styles = StyleSheet.create({
  content: { paddingTop: 16, paddingBottom: 34, gap: 9 },
  header: { gap: 10, marginBottom: 6 },
  topBar: { height: 38, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backButton: { width: 38, height: 38, borderWidth: 1, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  backText: { fontSize: 26, lineHeight: 30, fontWeight: "300", marginTop: -2 },
  topBarTitle: { fontSize: 10, letterSpacing: 1.5, fontWeight: "900" },
  topBarSpacer: { width: 38 },
  title: { fontFamily: "Georgia", fontSize: 29, lineHeight: 36, fontWeight: "700" },
  sub: { fontSize: 13, lineHeight: 19 },
  resume: { fontSize: 11, lineHeight: 16, textTransform: "capitalize" },
  sectionTitle: { fontSize: 10, letterSpacing: 1.5, fontWeight: "900", marginTop: 4 },
  focusSheet: { borderWidth: 1.5, borderRadius: 24, padding: 16, gap: 10, marginTop: 2 },
  focusHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  focusMark: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  focusMarkText: { fontSize: 20, fontWeight: "900" },
  focusCopyWrap: { flex: 1, gap: 2 },
  focusLabel: { fontSize: 9, letterSpacing: 1.1, fontWeight: "900" },
  focusTitle: { fontSize: 19, fontWeight: "900" },
  focusCopy: { fontSize: 13, lineHeight: 19 },
  primaryAction: { minHeight: 50, borderRadius: 16, paddingHorizontal: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  primaryActionText: { fontSize: 13, fontWeight: "900" },
  primaryActionArrow: { fontSize: 27, fontWeight: "300" },
  caseAction: { minHeight: 43, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  caseActionText: { fontSize: 12, fontWeight: "900" },
  caseActionArrow: { fontSize: 23, fontWeight: "300" },
  courseSectionLabel: { fontSize: 9, letterSpacing: 1.2, fontWeight: "900", marginTop: 2 },
  courseList: { gap: 9, paddingTop: 1, paddingBottom: 1 },
  courseCard: { width: 178, minHeight: 156, borderWidth: 1, borderRadius: 17, padding: 12, gap: 5 },
  courseTitle: { fontSize: 14, lineHeight: 18, fontWeight: "900" },
  courseSummary: { fontSize: 11, lineHeight: 16, flex: 1 },
  courseMode: { fontSize: 9, lineHeight: 13, fontWeight: "800" },
  courseAction: { fontSize: 11, fontWeight: "900" },
  packRow: { minHeight: 86, borderWidth: 1, borderRadius: 18, padding: 13, flexDirection: "row", alignItems: "center", gap: 10 },
  packDot: { width: 9, height: 42, borderRadius: 99 },
  packCopy: { flex: 1, gap: 3 },
  packTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  packFaculty: { fontSize: 8, letterSpacing: 1, fontWeight: "900", flex: 1 },
  packStatus: { fontSize: 8, letterSpacing: 0.7, fontWeight: "900" },
  packTitle: { fontSize: 15, fontWeight: "900" },
  packDescription: { fontSize: 11, lineHeight: 15 },
  packChevron: { fontSize: 25, fontWeight: "300" },
  empty: { borderWidth: 1, borderRadius: 18, padding: 17, gap: 5 },
  emptyTitle: { fontSize: 16, fontWeight: "900" },
  emptyText: { fontSize: 13, lineHeight: 19 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
});

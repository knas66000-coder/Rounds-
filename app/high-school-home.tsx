import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { haptic } from "@/lib/haptics";
import { HIGH_SCHOOL_LEVELS, highSchoolLevelLabel, loadHighSchoolLevel, loadHighSchoolRevisionPlan, saveHighSchoolLevel, saveHighSchoolRevisionPlan, type HighSchoolLevel, type HighSchoolRevisionPlan } from "@/lib/high-school-store";
import { loadHighSchoolTopicProgress, topicProgressForPack, type HighSchoolTopicProgressState } from "@/lib/high-school-topic-store";
import { isPackInstalled, loadCoursePackInstalls, type CoursePackInstall } from "@/lib/course-pack-store";
import { courseRoundSnapshot, loadCourseRoundState, type CourseRoundState } from "@/lib/course-round-store";
import { trpc } from "@/lib/trpc";
import { isUgandaHighSchoolProgram } from "@/shared/academic-profile";
import { highSchoolCoursePacks, type CoursePack } from "@/shared/course-packs";

const PACK_ACCENTS: Record<string, string> = {
  "uganda-high-school-biology": "#39735D", "uganda-high-school-chemistry": "#5A5E9F", "uganda-high-school-economics": "#8B5E39", "uganda-high-school-entrepreneurship": "#986543", "uganda-high-school-english": "#6E527D", "uganda-high-school-physics": "#3D6D92", "uganda-high-school-mathematics": "#8C4C5F", "uganda-high-school-geography": "#547B69", "uganda-high-school-history-civics": "#7B6150", "uganda-high-school-ict": "#386D83", "uganda-high-school-agriculture": "#6B7D40", "uganda-high-school-religion-ethics": "#765A7C", "uganda-high-school-kiswahili": "#3B7181", "uganda-high-school-literature": "#8B5A72", "uganda-high-school-fine-art": "#A4673C", "uganda-high-school-technical-drawing": "#4B6787", "uganda-high-school-food-nutrition": "#9B7040", "uganda-high-school-music": "#6C5591", "uganda-high-school-physical-education": "#3F7A70",
};

const fallbackRoundState: CourseRoundState = { records: [], bookmarks: [] };
const fallbackTopicProgress: HighSchoolTopicProgressState = { records: [], savedUnitIds: [] };

export default function HighSchoolHomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const profileQuery = trpc.academicProfile.get.useQuery();
  const profile = profileQuery.data;
  const [level, setLevel] = useState<HighSchoolLevel>("s1");
  const [installs, setInstalls] = useState<CoursePackInstall[]>([]);
  const [revision, setRevision] = useState<HighSchoolRevisionPlan>({ focusPackId: null, weeklyTarget: 3, updatedAt: null });
  const [roundState, setRoundState] = useState<CourseRoundState>(fallbackRoundState);
  const [topicProgress, setTopicProgress] = useState<HighSchoolTopicProgressState>(fallbackTopicProgress);
  const [ready, setReady] = useState(false);
  const packs = useMemo(() => highSchoolCoursePacks(), []);
  const focusPack = packs.find((pack) => pack.id === revision.focusPackId) ?? null;
  const overallTopics = packs.reduce((sum, pack) => sum + topicProgressForPack(pack.id, topicProgress).completed, 0);
  const overallSaved = packs.reduce((sum, pack) => sum + topicProgressForPack(pack.id, topicProgress).saved, 0);

  useEffect(() => {
    void Promise.all([loadHighSchoolLevel(), loadCoursePackInstalls(), loadHighSchoolRevisionPlan(), loadCourseRoundState(), loadHighSchoolTopicProgress()]).then(([nextLevel, nextInstalls, nextRevision, nextRoundState, nextTopicProgress]) => {
      setLevel(nextLevel);
      setInstalls(nextInstalls);
      setRevision(nextRevision);
      setRoundState(nextRoundState);
      setTopicProgress(nextTopicProgress);
      setReady(true);
    });
  }, []);

  if (!profile || !isUgandaHighSchoolProgram(profile.program)) return null;

  const chooseLevel = async (next: HighSchoolLevel) => { haptic.medium(); setLevel(next); await saveHighSchoolLevel(next); };
  const chooseRevisionFocus = async (packId: string) => { haptic.light(); setRevision(await saveHighSchoolRevisionPlan({ focusPackId: packId, weeklyTarget: revision.weeklyTarget })); };
  const changeWeeklyTarget = async () => { haptic.light(); const weeklyTarget = revision.weeklyTarget === 4 ? 2 : revision.weeklyTarget + 1 as 2 | 3 | 4; setRevision(await saveHighSchoolRevisionPlan({ focusPackId: revision.focusPackId, weeklyTarget })); };
  const openPack = (pack: CoursePack, review = false) => {
    haptic.light();
    if (!isPackInstalled(pack, installs)) { router.push({ pathname: "/course-packs", params: { focus: pack.id, level } } as never); return; }
    if (review) { router.push({ pathname: "/course-round", params: { packId: pack.id, level, review: "1" } } as never); return; }
    router.push({ pathname: "/high-school-topics", params: { packId: pack.id, level } } as never);
  };

  return (
    <ScreenContainer className="px-5" edges={["top", "left", "right"]}>
      <FlatList
        data={packs}
        keyExtractor={(pack) => pack.id}
        numColumns={2}
        columnWrapperStyle={styles.columns}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<View style={styles.header}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>UGANDA HIGH SCHOOL</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>Your varied study space.</Text>
          <Text style={[styles.sub, { color: colors.muted }]}>{profile.institutionName} · choose your level, add a subject locally, then study with varied topic sessions.</Text>
          <View style={[styles.levelSheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.levelLabel, { color: colors.primary }]}>CURRENT STUDY LEVEL</Text>
            <Text style={[styles.levelTitle, { color: colors.foreground }]}>{highSchoolLevelLabel(level)}</Text>
            <Text style={[styles.levelNote, { color: colors.muted }]}>Your level stays private on this device. Rounds prioritises matching topic units, then broadens the session so it does not circle the same topic.</Text>
            <FlatList horizontal data={HIGH_SCHOOL_LEVELS} keyExtractor={(item) => item.id} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.levelList} renderItem={({ item }) => <Pressable onPress={() => void chooseLevel(item.id)} accessibilityRole="radio" accessibilityState={{ selected: level === item.id }} style={({ pressed }) => [styles.levelChip, { borderColor: level === item.id ? colors.primary : colors.border, backgroundColor: level === item.id ? colors.primary : colors.background }, pressed && styles.pressed]}><Text style={[styles.levelChipTitle, { color: level === item.id ? colors.background : colors.foreground }]}>{item.title}</Text><Text style={[styles.levelChipBand, { color: level === item.id ? colors.background : colors.muted }]}>{item.band}</Text></Pressable>} />
          </View>
          <View style={[styles.progressStrip, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <Metric colors={colors} value={String(overallTopics)} label="TOPICS COMPLETED" />
            <Metric colors={colors} value={String(overallSaved)} label="SAVED TOPICS" />
            <Metric colors={colors} value={ready ? String(installs.filter((entry) => packs.some((pack) => pack.id === entry.packId)).length) : "–"} label="OFFLINE PACKS" />
          </View>
          <View style={styles.actionRow}>
            <QuickAction colors={colors} primary label="Manage offline subjects" onPress={() => { haptic.light(); router.push({ pathname: "/course-packs", params: { level } } as never); }} />
            <QuickAction colors={colors} label="Study profile" onPress={() => { haptic.light(); router.push("/academic-onboarding" as never); }} />
          </View>
          <View style={[styles.revisionSheet, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <View style={styles.revisionTop}><View><Text style={[styles.levelLabel, { color: colors.primary }]}>REVISION PLAN</Text><Text style={[styles.revisionTitle, { color: colors.foreground }]}>{focusPack ? `${focusPack.title.replace("High School ", "")} focus` : "Choose a revision focus"}</Text></View><Pressable onPress={() => void changeWeeklyTarget()} accessibilityRole="button" style={({ pressed }) => [styles.targetButton, { borderColor: colors.primary }, pressed && styles.pressed]}><Text style={[styles.targetButtonText, { color: colors.primary }]}>{revision.weeklyTarget} sessions / week</Text></Pressable></View>
            <FlatList horizontal data={packs} keyExtractor={(pack) => pack.id} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.revisionList} renderItem={({ item }) => <Pressable onPress={() => void chooseRevisionFocus(item.id)} accessibilityRole="radio" accessibilityState={{ selected: item.id === revision.focusPackId }} style={({ pressed }) => [styles.revisionChip, { borderColor: item.id === revision.focusPackId ? PACK_ACCENTS[item.id] ?? colors.primary : colors.border, backgroundColor: item.id === revision.focusPackId ? PACK_ACCENTS[item.id] ?? colors.primary : colors.background }, pressed && styles.pressed]}><Text style={[styles.revisionChipText, { color: item.id === revision.focusPackId ? colors.background : colors.foreground }]}>{item.title.replace("High School ", "")}</Text></Pressable>} />
            {focusPack ? <QuickAction colors={colors} label="Open saved starter review" accent={PACK_ACCENTS[focusPack.id] ?? colors.primary} onPress={() => openPack(focusPack, true)} /> : null}
          </View>
          <Text style={[styles.subjectHeading, { color: colors.muted }]}>SUBJECTS AND ELECTIVES · {ready ? "TAP A PACK FOR A VARIED TOPIC SESSION OR ADD IT OFFLINE" : "CHECKING DEVICE"}</Text>
        </View>}
        renderItem={({ item }) => {
          const installed = isPackInstalled(item, installs);
          const topicSnapshot = topicProgressForPack(item.id, topicProgress);
          const starterSnapshot = courseRoundSnapshot(item.id, roundState);
          const accent = PACK_ACCENTS[item.id] ?? colors.primary;
          return <Pressable onPress={() => openPack(item)} accessibilityRole="button" accessibilityLabel={`Open ${item.title}`} style={({ pressed }) => [styles.subjectCard, { borderColor: accent, backgroundColor: colors.surface }, pressed && styles.pressed]}><View style={[styles.subjectDot, { backgroundColor: accent }]} /><Text numberOfLines={2} style={[styles.subjectTitle, { color: colors.foreground }]}>{item.title.replace("High School ", "")}</Text><Text style={[styles.subjectState, { color: installed ? colors.success : colors.muted }]}>{installed ? "READY OFFLINE" : "ADD TO DEVICE"}</Text><Text numberOfLines={2} style={[styles.subjectCopy, { color: colors.muted }]}>{topicSnapshot.completed}/{topicSnapshot.total} topics · {topicSnapshot.saved} saved · {starterSnapshot.completed} starters</Text><Text style={[styles.subjectAction, { color: accent }]}>{installed ? "Start 4-topic session ›" : "Open pack ›"}</Text></Pressable>;
        }}
        ListFooterComponent={<View style={[styles.boundary, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={[styles.boundaryTitle, { color: colors.foreground }]}>Designed for your learning journey</Text><Text style={[styles.boundaryText, { color: colors.muted }]}>Rounds provides original topic learning and private progress. It does not replace school teaching, issue grades, predict examinations, or represent official NCDC or UNEB coverage.</Text></View>}
        ListEmptyComponent={<View style={styles.loading}><ActivityIndicator color={colors.primary} /></View>}
      />
    </ScreenContainer>
  );
}

function Metric({ colors, value, label }: { colors: ReturnType<typeof useColors>; value: string; label: string }) { return <View><Text style={[styles.progressNumber, { color: colors.foreground }]}>{value}</Text><Text style={[styles.progressLabel, { color: colors.muted }]}>{label}</Text></View>; }
function QuickAction({ colors, label, onPress, primary = false, accent }: { colors: ReturnType<typeof useColors>; label: string; onPress: () => void; primary?: boolean; accent?: string }) { const tone = accent ?? (primary ? colors.primary : colors.foreground); return <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.quickAction, { flex: primary ? 1.45 : 1, borderColor: tone }, pressed && styles.pressed]}><Text style={[styles.quickActionText, { color: tone }]}>{label}</Text><Text style={[styles.actionChevron, { color: tone }]}>›</Text></Pressable>; }

const styles = StyleSheet.create({
  content: { paddingTop: 16, paddingBottom: 34, gap: 10 }, header: { gap: 12, marginBottom: 2 }, eyebrow: { fontSize: 10, letterSpacing: 1.6, fontWeight: "900" }, title: { fontFamily: "Georgia", fontSize: 30, lineHeight: 37, fontWeight: "700" }, sub: { fontSize: 13, lineHeight: 19 }, levelSheet: { borderWidth: 1, borderRadius: 21, padding: 15, gap: 6 }, levelLabel: { fontSize: 9, letterSpacing: 1.2, fontWeight: "900" }, levelTitle: { fontSize: 19, fontWeight: "900" }, levelNote: { fontSize: 11, lineHeight: 16 }, levelList: { gap: 7, paddingTop: 6 }, levelChip: { width: 92, minHeight: 59, borderWidth: 1, borderRadius: 14, paddingHorizontal: 10, justifyContent: "center", gap: 3 }, levelChipTitle: { fontSize: 12, fontWeight: "900" }, levelChipBand: { fontSize: 8, lineHeight: 11, fontWeight: "800" }, progressStrip: { borderWidth: 1, borderRadius: 18, padding: 13, flexDirection: "row", justifyContent: "space-between" }, progressNumber: { fontFamily: "Georgia", fontSize: 22, fontWeight: "700" }, progressLabel: { fontSize: 8, letterSpacing: 0.8, fontWeight: "900", marginTop: 2 }, actionRow: { flexDirection: "row", gap: 9 }, quickAction: { minHeight: 47, borderWidth: 1, borderRadius: 15, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, quickActionText: { fontSize: 12, fontWeight: "900" }, actionChevron: { fontSize: 22, fontWeight: "300" }, revisionSheet: { borderWidth: 1, borderRadius: 20, padding: 14, gap: 9 }, revisionTop: { flexDirection: "row", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }, revisionTitle: { fontSize: 15, lineHeight: 20, fontWeight: "900", marginTop: 2, maxWidth: 170 }, targetButton: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 9, paddingVertical: 8 }, targetButtonText: { fontSize: 10, fontWeight: "900" }, revisionList: { gap: 7 }, revisionChip: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8 }, revisionChipText: { fontSize: 10, fontWeight: "900" }, subjectHeading: { fontSize: 10, letterSpacing: 1.25, fontWeight: "900", marginTop: 2 }, columns: { gap: 10 }, subjectCard: { flex: 1, minHeight: 164, borderWidth: 1, borderRadius: 19, padding: 13, gap: 5 }, subjectDot: { width: 26, height: 6, borderRadius: 99 }, subjectTitle: { fontSize: 15, lineHeight: 19, fontWeight: "900", marginTop: 1 }, subjectState: { fontSize: 8, letterSpacing: 0.8, fontWeight: "900" }, subjectCopy: { flex: 1, fontSize: 11, lineHeight: 15 }, subjectAction: { fontSize: 11, fontWeight: "900" }, boundary: { borderWidth: 1, borderRadius: 18, padding: 15, gap: 5, marginTop: 2 }, boundaryTitle: { fontSize: 14, fontWeight: "900" }, boundaryText: { fontSize: 12, lineHeight: 18 }, loading: { paddingVertical: 34, alignItems: "center" }, pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
});

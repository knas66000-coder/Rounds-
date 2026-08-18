import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { activitiesForCourseRound, courseRoundActivityId, courseRoundSnapshot, loadCourseRoundState, recordCourseRoundOutcome, saveCourseRoundState, toggleCourseRoundBookmark, type CourseRoundState } from "@/lib/course-round-store";
import { isPackInstalled, loadCoursePackInstalls } from "@/lib/course-pack-store";
import { coursePackForId } from "@/shared/course-packs";
import type { StarterCourseActivity } from "@/shared/course-pack-activities";

function shuffled<T>(items: T[], nonce: number): T[] {
  const copy = [...items];
  let seed = (nonce + 1) * 2147483647;
  for (let index = copy.length - 1; index > 0; index -= 1) {
    seed = (seed * 48271) % 2147483647;
    const swap = seed % (index + 1);
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

export default function CourseRoundScreen() {
  const colors = useColors();
  const router = useRouter();
  const { packId = "", review } = useLocalSearchParams<{ packId?: string; review?: string }>();
  const pack = coursePackForId(packId);
  const reviewOnly = review === "1";
  const [state, setState] = useState<CourseRoundState>({ records: [], bookmarks: [] });
  const [installed, setInstalled] = useState(false);
  const [index, setIndex] = useState(0);
  const [nonce, setNonce] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    void Promise.all([loadCourseRoundState(), loadCoursePackInstalls()]).then(([nextState, installs]) => {
      setState(nextState);
      setInstalled(pack ? isPackInstalled(pack, installs) : false);
    });
  }, [pack]);

  const queue = useMemo(() => shuffled(activitiesForCourseRound(packId, state, reviewOnly), nonce), [packId, state, reviewOnly, nonce]);
  const activity = queue[index];
  const snapshot = courseRoundSnapshot(packId, state);
  const activityId = activity ? courseRoundActivityId(activity) : "";
  const bookmarked = activityId ? state.bookmarks.includes(activityId) : false;

  const updateState = async (next: CourseRoundState) => {
    setState(next);
    await saveCourseRoundState(next);
  };

  const choose = (option: string) => {
    if (!activity || activity.kind !== "evidence_reading" || selected) return;
    setSelected(option);
    setComplete(true);
    void updateState(recordCourseRoundOutcome(state, activityId, option === activity.correctOption ? "correct" : "review"));
  };

  const savePlanner = () => {
    if (!activity || activity.kind !== "writing_planner" || !draft.trim() || complete) return;
    setComplete(true);
    void updateState(recordCourseRoundOutcome(state, activityId, "completed"));
  };

  const nextActivity = () => {
    if (index + 1 >= queue.length) return;
    setIndex((value) => value + 1);
    setSelected(null);
    setDraft("");
    setComplete(false);
  };

  const freshRound = () => {
    setIndex(0);
    setNonce((value) => value + 1);
    setSelected(null);
    setDraft("");
    setComplete(false);
  };

  if (!pack) return <Unavailable colors={colors} router={router} title="This learning pack is not available." />;
  if (!installed) return <Unavailable colors={colors} router={router} title={`Add ${pack.title} for offline before starting its learning round.`} />;
  if (!activity) return <ScreenContainer className="p-6 justify-center"><Text style={[styles.title, { color: colors.foreground }]}>{reviewOnly ? "No saved activities yet." : "This pack is ready for its next reviewed activity."}</Text><Text style={[styles.body, { color: colors.muted }]}>{reviewOnly ? "Save an activity during a learning round to revisit it here." : "Rounds does not insert unrelated subject content just to fill a round."}</Text><Pressable onPress={() => router.replace("/course-packs" as never)}><Text style={[styles.link, { color: colors.primary }]}>Return to Course Packs</Text></Pressable></ScreenContainer>;

  return <ScreenContainer className="px-5" edges={["top", "left", "right"]}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><Pressable onPress={() => router.back()} accessibilityRole="button"><Text style={[styles.back, { color: colors.primary }]}>‹ Course packs</Text></Pressable><View style={styles.headRow}><View><Text style={[styles.eyebrow, { color: colors.primary }]}>{reviewOnly ? "SAVED ACTIVITY REVIEW" : "LEARNING ROUND"}</Text><Text style={[styles.title, { color: colors.foreground }]}>{pack.title}</Text></View><View style={[styles.progressPill, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={[styles.progressNumber, { color: colors.primary }]}>{index + 1}/{queue.length}</Text><Text style={[styles.progressLabel, { color: colors.muted }]}>activity</Text></View></View><View style={[styles.roundCard, { borderColor: colors.border, backgroundColor: colors.surface }]}><View style={styles.meta}><Text style={[styles.eyebrow, { color: colors.primary }]}>{activity.eyebrow}</Text><Pressable onPress={() => void updateState(toggleCourseRoundBookmark(state, activityId))} accessibilityRole="button" style={[styles.save, { borderColor: bookmarked ? colors.primary : colors.border, backgroundColor: bookmarked ? colors.primary : colors.background }]}><Text style={[styles.saveText, { color: bookmarked ? colors.background : colors.primary }]}>{bookmarked ? "★ Saved" : "☆ Save"}</Text></Pressable></View><Text style={[styles.activityTitle, { color: colors.foreground }]}>{activity.title}</Text>{activity.kind === "evidence_reading" ? <EvidenceRound activity={activity} selected={selected} complete={complete} colors={colors} onChoose={choose} /> : <WritingRound activity={activity} draft={draft} complete={complete} colors={colors} onDraft={setDraft} onSave={savePlanner} />}</View>{complete ? <Pressable onPress={nextActivity} disabled={index + 1 >= queue.length} accessibilityRole="button" style={({ pressed }) => [styles.nextButton, { backgroundColor: index + 1 >= queue.length ? colors.border : colors.primary }, pressed && index + 1 < queue.length && styles.pressed]}><Text style={[styles.nextText, { color: index + 1 >= queue.length ? colors.muted : colors.background }]}>{index + 1 >= queue.length ? "Round completed" : "Next activity"}</Text></Pressable> : null}{index + 1 >= queue.length && complete ? <Pressable onPress={freshRound} accessibilityRole="button" style={[styles.freshButton, { borderColor: colors.primary }]}><Text style={[styles.freshText, { color: colors.primary }]}>Start fresh round</Text></Pressable> : null}<View style={[styles.snapshot, { borderColor: colors.border }]}><Text style={[styles.eyebrow, { color: colors.muted }]}>SESSION SNAPSHOT</Text><View style={styles.snapshotRow}><Stat label="Completed" value={String(snapshot.completed)} color={colors.foreground} /><Stat label="Evidence matched" value={String(snapshot.correct)} color={colors.success} /><Stat label="Review" value={String(snapshot.review)} color={colors.warning} /><Stat label="Saved" value={String(snapshot.saved)} color={colors.primary} /></View><Pressable onPress={() => router.replace({ pathname: "/course-round", params: { packId, review: "1" } } as never)} accessibilityRole="button"><Text style={[styles.reviewLink, { color: colors.primary }]}>Review saved activities ›</Text></Pressable></View></ScrollView></ScreenContainer>;
}

function EvidenceRound({ activity, selected, complete, colors, onChoose }: { activity: Extract<StarterCourseActivity, { kind: "evidence_reading" }>; selected: string | null; complete: boolean; colors: ReturnType<typeof useColors>; onChoose: (option: string) => void }) {
  const correct = selected === activity.correctOption;
  return <View style={styles.stack}><View style={[styles.passage, { borderColor: colors.border, backgroundColor: colors.background }]}><Text style={[styles.passageTitle, { color: colors.foreground }]}>{activity.passageTitle}</Text><Text style={[styles.body, { color: colors.muted }]}>{activity.passage}</Text></View><Text style={[styles.prompt, { color: colors.foreground }]}>{activity.prompt}</Text>{activity.options.map((option) => <Pressable key={option} disabled={complete} onPress={() => onChoose(option)} accessibilityRole="button" style={({ pressed }) => [styles.option, { borderColor: selected === option ? (correct ? colors.success : colors.error) : colors.border, backgroundColor: colors.background }, pressed && !complete && styles.pressed]}><Text style={[styles.optionText, { color: colors.foreground }]}>{option}</Text></Pressable>)}{complete ? <View style={[styles.feedback, { borderColor: correct ? colors.success : colors.warning, backgroundColor: colors.background }]}><Text style={[styles.feedbackTitle, { color: correct ? colors.success : colors.warning }]}>{correct ? "Evidence matched" : "Save this for review"}</Text><Text style={[styles.body, { color: colors.muted }]}>{activity.explanation}</Text></View> : null}</View>;
}

function WritingRound({ activity, draft, complete, colors, onDraft, onSave }: { activity: Extract<StarterCourseActivity, { kind: "writing_planner" }>; draft: string; complete: boolean; colors: ReturnType<typeof useColors>; onDraft: (value: string) => void; onSave: () => void }) {
  return <View style={styles.stack}><View style={[styles.passage, { borderColor: colors.border, backgroundColor: colors.background }]}><Text style={[styles.body, { color: colors.muted }]}>{activity.brief}</Text></View><Text style={[styles.prompt, { color: colors.foreground }]}>{activity.prompts[0].label}</Text><Text style={[styles.helper, { color: colors.muted }]}>{activity.prompts[0].helper}</Text><TextInput value={draft} onChangeText={onDraft} editable={!complete} multiline placeholder="Write a private planning response" placeholderTextColor={colors.muted} style={[styles.input, { borderColor: colors.border, backgroundColor: colors.background, color: colors.foreground }]} accessibilityLabel="Private planning response" />{!complete ? <Pressable onPress={onSave} accessibilityRole="button" style={({ pressed }) => [styles.nextButton, { backgroundColor: colors.primary }, pressed && styles.pressed]}><Text style={[styles.nextText, { color: colors.background }]}>Save and continue</Text></Pressable> : <View style={[styles.feedback, { borderColor: colors.success, backgroundColor: colors.background }]}><Text style={[styles.feedbackTitle, { color: colors.success }]}>Private plan saved</Text><Text style={[styles.body, { color: colors.muted }]}>Your note is complete for this round. Rounds records completion but does not falsely grade subjective writing.</Text></View>}</View>;
}

function Unavailable({ colors, router, title }: { colors: ReturnType<typeof useColors>; router: ReturnType<typeof useRouter>; title: string }) {
  return <ScreenContainer className="p-6 justify-center"><Text style={[styles.title, { color: colors.foreground }]}>{title}</Text><Pressable onPress={() => router.replace("/course-packs" as never)}><Text style={[styles.link, { color: colors.primary }]}>Return to Course Packs</Text></Pressable></ScreenContainer>;
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) { return <View><Text style={[styles.statValue, { color }]}>{value}</Text><Text style={[styles.statLabel, { color: "#687076" }]}>{label}</Text></View>; }

const styles = StyleSheet.create({
  content: { paddingTop: 19, paddingBottom: 40, gap: 14 }, back: { fontSize: 14, fontWeight: "900" }, headRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 14 }, eyebrow: { fontSize: 10, letterSpacing: 1.3, fontWeight: "900" }, title: { fontFamily: "Georgia", fontSize: 28, lineHeight: 36, fontWeight: "700" }, progressPill: { borderWidth: 1, borderRadius: 15, alignItems: "center", paddingHorizontal: 11, paddingVertical: 8 }, progressNumber: { fontSize: 16, fontWeight: "900" }, progressLabel: { fontSize: 10 }, roundCard: { borderWidth: 1, borderRadius: 22, padding: 17, gap: 12 }, meta: { flexDirection: "row", justifyContent: "space-between", gap: 8, alignItems: "center" }, save: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 7 }, saveText: { fontSize: 11, fontWeight: "900" }, activityTitle: { fontSize: 20, lineHeight: 27, fontWeight: "900" }, stack: { gap: 10 }, passage: { borderWidth: 1, borderRadius: 16, padding: 14, gap: 6 }, passageTitle: { fontSize: 15, fontWeight: "900" }, body: { fontSize: 14, lineHeight: 21 }, prompt: { fontSize: 16, lineHeight: 23, fontWeight: "900" }, helper: { fontSize: 12, lineHeight: 17 }, option: { borderWidth: 1, borderRadius: 15, padding: 13 }, optionText: { fontSize: 14, lineHeight: 20, fontWeight: "700" }, feedback: { borderWidth: 1, borderRadius: 15, padding: 14, gap: 5 }, feedbackTitle: { fontSize: 14, fontWeight: "900" }, input: { minHeight: 116, borderWidth: 1, borderRadius: 15, padding: 13, textAlignVertical: "top", fontSize: 14, lineHeight: 20 }, nextButton: { minHeight: 53, borderRadius: 16, alignItems: "center", justifyContent: "center" }, nextText: { fontSize: 15, fontWeight: "900" }, freshButton: { minHeight: 47, borderWidth: 1, borderRadius: 15, alignItems: "center", justifyContent: "center" }, freshText: { fontSize: 14, fontWeight: "900" }, snapshot: { borderWidth: 1, borderRadius: 20, padding: 15, gap: 12 }, snapshotRow: { flexDirection: "row", justifyContent: "space-between", gap: 7 }, statValue: { fontSize: 20, fontWeight: "900" }, statLabel: { fontSize: 10, marginTop: 1, maxWidth: 63 }, reviewLink: { fontSize: 13, fontWeight: "900", textAlign: "center" }, link: { fontSize: 14, fontWeight: "900", marginTop: 16 }, pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
});

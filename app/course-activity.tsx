import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { isPackInstalled, loadCoursePackInstalls, saveCoursePackResume } from "@/lib/course-pack-store";
import { starterActivityFor } from "@/shared/course-pack-activities";
import { coursePackForId } from "@/shared/course-packs";

export default function CourseActivityScreen() {
  const colors = useColors();
  const router = useRouter();
  const { packId = "", courseId = "" } = useLocalSearchParams<{ packId?: string; courseId?: string }>();
  const activity = starterActivityFor(packId, courseId);
  const pack = coursePackForId(packId);
  const [installed, setInstalled] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const draftKey = `rounds.course-packs.draft.${packId}.${courseId}.v1`;

  useEffect(() => {
    if (!pack) return;
    void loadCoursePackInstalls().then((installs) => setInstalled(isPackInstalled(pack, installs)));
    if (activity?.kind === "writing_planner") void AsyncStorage.getItem(draftKey).then((value) => {
      if (!value) return;
      try { setDrafts(JSON.parse(value) as Record<string, string>); } catch { setDrafts({}); }
    });
  }, [activity?.kind, draftKey, pack]);

  const complete = async () => {
    if (!pack || !activity) return;
    await saveCoursePackResume(pack.id, activity.courseId);
    setSaved(true);
  };

  const chooseOption = (option: string) => {
    if (selectedOption) return;
    setSelectedOption(option);
    void complete();
  };

  const saveDraft = async () => {
    if (!activity || activity.kind !== "writing_planner") return;
    if (!activity.prompts.some((prompt) => (drafts[prompt.id] ?? "").trim())) {
      Alert.alert("Add a planning note", "Write at least one private planning note before saving this activity.");
      return;
    }
    await AsyncStorage.setItem(draftKey, JSON.stringify(drafts));
    await complete();
  };

  if (!activity || !pack) return <ScreenContainer className="p-6 justify-center"><Text style={[styles.title, { color: colors.foreground }]}>This starter activity is not available.</Text><Pressable onPress={() => router.replace("/course-packs" as never)}><Text style={[styles.link, { color: colors.primary }]}>Return to Course Packs</Text></Pressable></ScreenContainer>;
  if (!installed) return <ScreenContainer className="p-6 justify-center"><Text style={[styles.title, { color: colors.foreground }]}>Add this pack for offline first.</Text><Text style={[styles.body, { color: colors.muted }]}>Return to Course Packs and add {pack.title} before opening its local starter activities.</Text><Pressable onPress={() => router.replace("/course-packs" as never)}><Text style={[styles.link, { color: colors.primary }]}>Return to Course Packs</Text></Pressable></ScreenContainer>;

  return <ScreenContainer className="px-5" edges={["top", "left", "right"]}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><Pressable onPress={() => router.back()} accessibilityRole="button"><Text style={[styles.back, { color: colors.primary }]}>‹ Course packs</Text></Pressable><Text style={[styles.eyebrow, { color: colors.primary }]}>{activity.eyebrow}</Text><Text style={[styles.title, { color: colors.foreground }]}>{activity.title}</Text>{activity.kind === "evidence_reading" ? <EvidenceActivity activity={activity} selectedOption={selectedOption} colors={colors} onChoose={chooseOption} /> : <WritingPlanner activity={activity} drafts={drafts} saved={saved} colors={colors} onChange={(id, value) => setDrafts((current) => ({ ...current, [id]: value }))} onSave={() => void saveDraft()} />}{saved ? <View style={[styles.saved, { borderColor: colors.success, backgroundColor: colors.surface }]}><Text style={[styles.savedTitle, { color: colors.success }]}>Saved locally</Text><Text style={[styles.savedText, { color: colors.muted }]}>Your progress is stored on this device. This starter activity is not an institutional grade.</Text></View> : null}</ScrollView></ScreenContainer>;
}

function EvidenceActivity({ activity, selectedOption, colors, onChoose }: { activity: Extract<ReturnType<typeof starterActivityFor>, { kind: "evidence_reading" }>; selectedOption: string | null; colors: ReturnType<typeof useColors>; onChoose: (option: string) => void }) {
  const correct = selectedOption === activity.correctOption;
  return <View style={styles.stack}><View style={[styles.passage, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={[styles.passageTitle, { color: colors.foreground }]}>{activity.passageTitle}</Text><Text style={[styles.passageText, { color: colors.muted }]}>{activity.passage}</Text></View><Text style={[styles.prompt, { color: colors.foreground }]}>{activity.prompt}</Text>{activity.options.map((option) => <Pressable key={option} disabled={Boolean(selectedOption)} onPress={() => onChoose(option)} accessibilityRole="button" style={({ pressed }) => [styles.option, { borderColor: selectedOption === option ? (correct ? colors.success : colors.error) : colors.border, backgroundColor: selectedOption === option ? colors.surface : colors.background }, pressed && !selectedOption && styles.pressed]}><Text style={[styles.optionText, { color: colors.foreground }]}>{option}</Text></Pressable>)}{selectedOption ? <View style={[styles.feedback, { borderColor: correct ? colors.success : colors.warning, backgroundColor: colors.surface }]}><Text style={[styles.feedbackTitle, { color: correct ? colors.success : colors.warning }]}>{correct ? "Evidence matched" : "Review the evidence"}</Text><Text style={[styles.feedbackText, { color: colors.muted }]}>{activity.explanation}</Text></View> : null}</View>;
}

function WritingPlanner({ activity, drafts, saved, colors, onChange, onSave }: { activity: Extract<ReturnType<typeof starterActivityFor>, { kind: "writing_planner" }>; drafts: Record<string, string>; saved: boolean; colors: ReturnType<typeof useColors>; onChange: (id: string, value: string) => void; onSave: () => void }) {
  return <View style={styles.stack}><View style={[styles.passage, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={[styles.passageText, { color: colors.muted }]}>{activity.brief}</Text></View>{activity.prompts.map((prompt) => <View key={prompt.id} style={styles.field}><Text style={[styles.fieldLabel, { color: colors.foreground }]}>{prompt.label}</Text><Text style={[styles.fieldHelper, { color: colors.muted }]}>{prompt.helper}</Text><TextInput value={drafts[prompt.id] ?? ""} onChangeText={(value) => onChange(prompt.id, value)} editable={!saved} multiline placeholder="Write a private planning note" placeholderTextColor={colors.muted} style={[styles.input, { borderColor: colors.border, backgroundColor: colors.background, color: colors.foreground }]} accessibilityLabel={prompt.label} /></View>)}<Pressable onPress={onSave} disabled={saved} accessibilityRole="button" style={({ pressed }) => [styles.saveButton, { backgroundColor: colors.primary }, (pressed || saved) && styles.pressed]}><Text style={[styles.saveButtonText, { color: colors.background }]}>{saved ? "Saved locally" : "Save private plan"}</Text></Pressable></View>;
}

const styles = StyleSheet.create({
  content: { paddingTop: 19, paddingBottom: 40, gap: 12 }, back: { fontSize: 14, fontWeight: "900", marginBottom: 3 }, eyebrow: { fontSize: 10, letterSpacing: 1.4, fontWeight: "900" }, title: { fontFamily: "Georgia", fontSize: 30, lineHeight: 38, fontWeight: "700" }, body: { fontSize: 14, lineHeight: 21, marginTop: 8 }, link: { fontSize: 14, fontWeight: "900", marginTop: 16 }, stack: { gap: 11 }, passage: { borderWidth: 1, borderRadius: 18, padding: 16, gap: 8 }, passageTitle: { fontSize: 16, fontWeight: "900" }, passageText: { fontSize: 14, lineHeight: 22 }, prompt: { fontSize: 17, lineHeight: 24, fontWeight: "900", marginTop: 3 }, option: { borderWidth: 1, borderRadius: 16, padding: 14 }, optionText: { fontSize: 14, lineHeight: 20, fontWeight: "700" }, feedback: { borderWidth: 1, borderRadius: 16, padding: 15, gap: 5 }, feedbackTitle: { fontSize: 14, fontWeight: "900" }, feedbackText: { fontSize: 13, lineHeight: 20 }, field: { gap: 5 }, fieldLabel: { fontSize: 16, fontWeight: "900" }, fieldHelper: { fontSize: 12, lineHeight: 17 }, input: { minHeight: 106, borderWidth: 1, borderRadius: 14, padding: 12, textAlignVertical: "top", fontSize: 14, lineHeight: 20 }, saveButton: { minHeight: 52, borderRadius: 16, alignItems: "center", justifyContent: "center", marginTop: 3 }, saveButtonText: { fontSize: 15, fontWeight: "900" }, saved: { borderWidth: 1, borderRadius: 16, padding: 14, gap: 4 }, savedTitle: { fontSize: 14, fontWeight: "900" }, savedText: { fontSize: 12, lineHeight: 18 }, pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
});

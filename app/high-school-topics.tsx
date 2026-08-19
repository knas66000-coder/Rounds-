import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { haptic } from "@/lib/haptics";
import { highSchoolLevelLabel, highSchoolTopicScopeLabel, isHighSchoolLevel, isHighSchoolTopicScope, type HighSchoolLevel, type HighSchoolTopicScope } from "@/lib/high-school-store";
import { highSchoolTopicSessionReasonLabel, selectHighSchoolTopicSession, type HighSchoolTopicSessionItem } from "@/lib/high-school-topic-session";
import { loadHighSchoolTopicProgress, recordHighSchoolTopicOutcome, saveHighSchoolTopicProgress, toggleHighSchoolTopicSaved, type HighSchoolTopicProgressState } from "@/lib/high-school-topic-store";
import { coursePackForId } from "@/shared/course-packs";
import { topicUnitModesLabel, topicUnitsForPack, type HighSchoolTopicUnit } from "@/shared/high-school-topic-units";

const fallbackProgress: HighSchoolTopicProgressState = { records: [], savedUnitIds: [] };

export default function HighSchoolTopicsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { packId = "", level: levelParam, scope: scopeParam } = useLocalSearchParams<{ packId?: string; level?: string; scope?: string }>();
  const level: HighSchoolLevel = isHighSchoolLevel(levelParam) ? levelParam : "s1";
  const scope: HighSchoolTopicScope = isHighSchoolTopicScope(scopeParam) ? scopeParam : "level_matched";
  const pack = coursePackForId(packId);
  const topicTotal = topicUnitsForPack(packId).length;
  const [progress, setProgress] = useState<HighSchoolTopicProgressState>(fallbackProgress);
  const [session, setSession] = useState<HighSchoolTopicSessionItem[]>([]);
  const [index, setIndex] = useState(0);
  const [nonce, setNonce] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [reflection, setReflection] = useState("");
  const [complete, setComplete] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void loadHighSchoolTopicProgress().then((next) => {
      setProgress(next);
      setSession(selectHighSchoolTopicSession(packId, level, next, 4, 0, scope));
      setReady(true);
    });
  }, [packId, level, scope]);

  if (!pack) return <Unavailable colors={colors} router={router} title="This high-school subject is not available." />;
  const current = session[index];
  const unit = current?.unit;
  const saved = unit ? progress.savedUnitIds.includes(unit.id) : false;

  const persist = async (next: HighSchoolTopicProgressState) => {
    setProgress(next);
    await saveHighSchoolTopicProgress(next);
  };

  const choose = (option: string) => {
    if (!unit || !unit.bestOption || complete) return;
    haptic.light();
    setSelected(option);
    setComplete(true);
    void persist(recordHighSchoolTopicOutcome(progress, unit.id, option === unit.bestOption ? "mastered" : "review"));
  };

  const saveReflection = () => {
    if (!unit || !reflection.trim() || complete) return;
    haptic.light();
    setComplete(true);
    void persist(recordHighSchoolTopicOutcome(progress, unit.id, "reflected"));
  };

  const toggleSaved = () => {
    if (!unit) return;
    haptic.light();
    void persist(toggleHighSchoolTopicSaved(progress, unit.id));
  };

  const next = () => {
    if (index + 1 >= session.length) return;
    setIndex((value) => value + 1);
    setSelected(null);
    setReflection("");
    setComplete(false);
  };

  const freshSession = () => {
    const nextNonce = nonce + 1;
    haptic.medium();
    setNonce(nextNonce);
    setSession(selectHighSchoolTopicSession(packId, level, progress, 4, nextNonce, scope));
    setIndex(0);
    setSelected(null);
    setReflection("");
    setComplete(false);
  };

  if (!ready) return <ScreenContainer className="items-center justify-center"><ActivityIndicator color={colors.primary} /></ScreenContainer>;
  if (!unit) return <Unavailable colors={colors} router={router} title="This subject is preparing its next topic session." />;

  const isReflection = unit.mode === "reflection";
  const correct = selected === unit.bestOption;
  return (
    <ScreenContainer className="px-5" edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} accessibilityRole="button"><Text style={[styles.back, { color: colors.primary }]}>‹ High-school study</Text></Pressable>
        <View style={styles.header}><View><Text style={[styles.eyebrow, { color: colors.primary }]}>{highSchoolTopicSessionReasonLabel(current.reason)} · {highSchoolLevelLabel(level).toUpperCase()}</Text><Text style={[styles.scopeTag, { color: colors.muted }]}>{highSchoolTopicScopeLabel(scope).toUpperCase()}</Text><Text style={[styles.title, { color: colors.foreground }]}>{pack.title}</Text></View><View style={[styles.progressPill, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={[styles.progressNumber, { color: colors.primary }]}>{index + 1}/{session.length}</Text><Text style={[styles.progressLabel, { color: colors.muted }]}>VARIED TOPICS</Text></View></View>
        <View style={[styles.sessionNote, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={[styles.sessionNoteText, { color: colors.muted }]}>{scope === "level_matched" ? `This ${session.length}-topic session stays within your ${highSchoolLevelLabel(level)} learning band. ` : `This ${session.length}-topic session prioritises your ${highSchoolLevelLabel(level)} learning band, then may connect to other bands. `}It draws from {topicTotal} local topic units and never repeats a topic or unit inside one session.</Text></View>
        <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <View style={styles.meta}><View><Text style={[styles.eyebrow, { color: colors.primary }]}>{topicUnitModesLabel(unit.mode).toUpperCase()}</Text><Text style={[styles.cue, { color: colors.muted }]}>{unit.cue}</Text></View><Pressable onPress={toggleSaved} accessibilityRole="button" style={[styles.save, { borderColor: saved ? colors.primary : colors.border, backgroundColor: saved ? colors.primary : colors.background }]}><Text style={[styles.saveText, { color: saved ? colors.background : colors.primary }]}>{saved ? "★ Saved" : "☆ Save"}</Text></Pressable></View>
          <Text style={[styles.activityTitle, { color: colors.foreground }]}>{unit.title}</Text>
          {unit.boundaryNote ? <Text style={[styles.boundary, { color: colors.muted }]}>{unit.boundaryNote}</Text> : null}
          {isReflection ? <ReflectionUnit unit={unit} draft={reflection} complete={complete} colors={colors} onChange={setReflection} onSave={saveReflection} /> : <ChoiceUnit unit={unit} selected={selected} complete={complete} correct={correct} colors={colors} onChoose={choose} />}
        </View>
        {complete ? <Pressable onPress={next} disabled={index + 1 >= session.length} accessibilityRole="button" style={({ pressed }) => [styles.nextButton, { backgroundColor: index + 1 >= session.length ? colors.border : colors.primary }, pressed && index + 1 < session.length && styles.pressed]}><Text style={[styles.nextText, { color: index + 1 >= session.length ? colors.muted : colors.background }]}>{index + 1 >= session.length ? "Session completed" : "Next varied topic"}</Text></Pressable> : null}
        {complete && index + 1 >= session.length ? <Pressable onPress={freshSession} accessibilityRole="button" style={({ pressed }) => [styles.freshButton, { borderColor: colors.primary }, pressed && styles.pressed]}><Text style={[styles.freshText, { color: colors.primary }]}>Build another varied session</Text></Pressable> : null}
      </ScrollView>
    </ScreenContainer>
  );
}

function ChoiceUnit({ unit, selected, complete, correct, colors, onChoose }: { unit: HighSchoolTopicUnit; selected: string | null; complete: boolean; correct: boolean; colors: ReturnType<typeof useColors>; onChoose: (option: string) => void }) {
  return <View style={styles.stack}><Text style={[styles.prompt, { color: colors.foreground }]}>{unit.prompt}</Text>{unit.options?.map((option) => <Pressable key={option} disabled={complete} onPress={() => onChoose(option)} accessibilityRole="button" style={({ pressed }) => [styles.option, { borderColor: selected === option ? (correct ? colors.success : colors.error) : colors.border, backgroundColor: colors.background }, pressed && !complete && styles.pressed]}><Text style={[styles.optionText, { color: colors.foreground }]}>{option}</Text></Pressable>)}{complete ? <View style={[styles.feedback, { borderColor: correct ? colors.success : colors.warning, backgroundColor: colors.background }]}><Text style={[styles.feedbackTitle, { color: correct ? colors.success : colors.warning }]}>{correct ? "Topic matched" : "Keep this topic in review"}</Text><Text style={[styles.body, { color: colors.muted }]}>{unit.explanation}</Text></View> : null}</View>;
}

function ReflectionUnit({ unit, draft, complete, colors, onChange, onSave }: { unit: HighSchoolTopicUnit; draft: string; complete: boolean; colors: ReturnType<typeof useColors>; onChange: (value: string) => void; onSave: () => void }) {
  return <View style={styles.stack}><Text style={[styles.prompt, { color: colors.foreground }]}>{unit.reflectionPrompt ?? unit.prompt}</Text><TextInput value={draft} onChangeText={onChange} editable={!complete} multiline placeholder="Write a private reflection" placeholderTextColor={colors.muted} style={[styles.input, { borderColor: colors.border, backgroundColor: colors.background, color: colors.foreground }]} accessibilityLabel="Private topic reflection" />{!complete ? <Pressable onPress={onSave} accessibilityRole="button" style={({ pressed }) => [styles.nextButton, { backgroundColor: colors.primary }, pressed && styles.pressed]}><Text style={[styles.nextText, { color: colors.background }]}>Record private reflection</Text></Pressable> : <View style={[styles.feedback, { borderColor: colors.success, backgroundColor: colors.background }]}><Text style={[styles.feedbackTitle, { color: colors.success }]}>Reflection recorded</Text><Text style={[styles.body, { color: colors.muted }]}>{unit.explanation}</Text></View>}</View>;
}

function Unavailable({ colors, router, title }: { colors: ReturnType<typeof useColors>; router: ReturnType<typeof useRouter>; title: string }) {
  return <ScreenContainer className="p-6 justify-center"><Text style={[styles.title, { color: colors.foreground }]}>{title}</Text><Pressable onPress={() => router.back()} accessibilityRole="button"><Text style={[styles.back, { color: colors.primary }]}>Go back</Text></Pressable></ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { paddingTop: 18, paddingBottom: 38, gap: 13 }, back: { fontSize: 14, fontWeight: "900" }, header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 14 }, eyebrow: { fontSize: 10, letterSpacing: 1.2, fontWeight: "900" }, scopeTag: { fontSize: 8, letterSpacing: 0.9, fontWeight: "900", marginTop: 3 }, title: { fontFamily: "Georgia", fontSize: 27, lineHeight: 34, fontWeight: "700", maxWidth: 244 }, progressPill: { borderWidth: 1, borderRadius: 15, alignItems: "center", paddingHorizontal: 10, paddingVertical: 8 }, progressNumber: { fontSize: 16, fontWeight: "900" }, progressLabel: { fontSize: 8, letterSpacing: 0.6, fontWeight: "900", marginTop: 1 }, sessionNote: { borderWidth: 1, borderRadius: 16, padding: 13 }, sessionNoteText: { fontSize: 12, lineHeight: 18 }, card: { borderWidth: 1, borderRadius: 22, padding: 16, gap: 12 }, meta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 }, cue: { fontSize: 11, lineHeight: 16, marginTop: 2 }, save: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 7 }, saveText: { fontSize: 11, fontWeight: "900" }, activityTitle: { fontSize: 21, lineHeight: 28, fontWeight: "900" }, boundary: { fontSize: 11, lineHeight: 16 }, stack: { gap: 10 }, prompt: { fontSize: 16, lineHeight: 23, fontWeight: "900" }, option: { borderWidth: 1, borderRadius: 15, padding: 13 }, optionText: { fontSize: 14, lineHeight: 20, fontWeight: "700" }, feedback: { borderWidth: 1, borderRadius: 15, padding: 14, gap: 5 }, feedbackTitle: { fontSize: 14, fontWeight: "900" }, body: { fontSize: 13, lineHeight: 19 }, input: { minHeight: 116, borderWidth: 1, borderRadius: 15, padding: 13, textAlignVertical: "top", fontSize: 14, lineHeight: 20 }, nextButton: { minHeight: 53, borderRadius: 16, alignItems: "center", justifyContent: "center" }, nextText: { fontSize: 15, fontWeight: "900" }, freshButton: { minHeight: 47, borderWidth: 1, borderRadius: 15, alignItems: "center", justifyContent: "center" }, freshText: { fontSize: 14, fontWeight: "900" }, pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
});

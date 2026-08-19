import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useRoundsVoice } from "@/hooks/use-rounds-voice";
import { haptic } from "@/lib/haptics";
import { normalizeUniversityTopicSearch, searchUniversityTopics } from "@/lib/university-topic-search";
import { savedUniversityTopicSession, selectedUniversityTopicSession, selectUniversityTopicSession, universityTopicSessionReasonLabel, type UniversityTopicSessionItem } from "@/lib/university-topic-session";
import { loadUniversityTopicProgress, recordUniversityTopicOutcome, saveUniversityTopicProgress, toggleUniversityTopicSaved, universityTopicProgressForPack, type UniversityTopicProgressState } from "@/lib/university-topic-store";
import { coursePackForId } from "@/shared/course-packs";
import { universityTopicModeLabel, universityTopicUnitForId, universityTopicUnitsForPack, type UniversityTopicUnit } from "@/shared/university-topic-units";
import { prepareLocalSpeech, stopRoundsSpeech } from "@/lib/voice";
import * as Speech from "expo-speech";

const fallbackProgress: UniversityTopicProgressState = { records: [], savedUnitIds: [] };

export default function UniversityTopicsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { preferences, selectedVoice } = useRoundsVoice();
  const { packId = "", unitId: unitIdParam, savedUnitId: savedUnitIdParam } = useLocalSearchParams<{ packId?: string; unitId?: string; savedUnitId?: string }>();
  const pack = coursePackForId(packId);
  const topicTotal = universityTopicUnitsForPack(packId).length;
  const [progress, setProgress] = useState<UniversityTopicProgressState>(fallbackProgress);
  const [session, setSession] = useState<UniversityTopicSessionItem[]>([]);
  const [index, setIndex] = useState(0);
  const [nonce, setNonce] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [reflection, setReflection] = useState("");
  const [complete, setComplete] = useState(false);
  const [query, setQuery] = useState("");
  const [ready, setReady] = useState(false);
  const normalizedQuery = normalizeUniversityTopicSearch(query);
  const hasSearchQuery = normalizedQuery.length >= 2;
  const searchResults = useMemo(() => hasSearchQuery ? searchUniversityTopics(packId, query) : [], [hasSearchQuery, packId, query]);
  const savedTopics = useMemo(() => progress.savedUnitIds
    .map((unitId) => universityTopicUnitForId(unitId))
    .filter((unit): unit is UniversityTopicUnit => Boolean(unit && unit.packId === packId))
    .sort((left, right) => (progress.records.find((record) => record.unitId === right.id)?.completedAt ?? "").localeCompare(progress.records.find((record) => record.unitId === left.id)?.completedAt ?? "")), [packId, progress]);

  useEffect(() => {
    void loadUniversityTopicProgress().then((next) => {
      setProgress(next);
      const savedTopic = savedUniversityTopicSession(packId, savedUnitIdParam, next);
      const selectedTopic = selectedUniversityTopicSession(packId, unitIdParam);
      setSession(savedTopic.length ? savedTopic : selectedTopic.length ? selectedTopic : selectUniversityTopicSession(packId, next, 4));
      setIndex(0);
      setSelected(null);
      setReflection("");
      setComplete(false);
      setReady(true);
    });
  }, [packId, savedUnitIdParam, unitIdParam]);

  if (!pack || topicTotal === 0) return <Unavailable colors={colors} router={router} title="This university topic pathway is not available." />;
  if (!ready) return <ScreenContainer className="items-center justify-center"><ActivityIndicator color={colors.primary} /></ScreenContainer>;
  const current = session[index];
  const unit = current?.unit;
  if (!unit) return <Unavailable colors={colors} router={router} title="This pack is preparing your next varied study session." />;

  const saved = progress.savedUnitIds.includes(unit.id);
  const isReflection = unit.mode === "reflection";
  const correct = selected === unit.bestOption;
  const packProgress = universityTopicProgressForPack(packId, progress);
  const listenToTopic = async () => {
    await stopRoundsSpeech(Speech);
    Speech.speak(prepareLocalSpeech(`${unit.title}. ${unit.cue}. ${unit.prompt}`), { rate: preferences.rate, ...(selectedVoice ? { voice: selectedVoice.identifier, language: selectedVoice.language } : {}) });
  };
  const persist = async (next: UniversityTopicProgressState) => { setProgress(next); await saveUniversityTopicProgress(next); };
  const choose = (option: string) => {
    if (!unit.bestOption || complete) return;
    haptic.light();
    setSelected(option);
    setComplete(true);
    void persist(recordUniversityTopicOutcome(progress, unit.id, option === unit.bestOption ? "mastered" : "review"));
  };
  const saveReflection = () => {
    if (!reflection.trim() || complete) return;
    haptic.light();
    setComplete(true);
    void persist(recordUniversityTopicOutcome(progress, unit.id, "reflected"));
  };
  const openSearchResult = (unitId: string) => { haptic.light(); setQuery(""); router.replace({ pathname: "/university-topics", params: { packId, unitId } } as never); };
  const openSavedTopic = (savedUnitId: string) => { haptic.light(); setQuery(""); router.replace({ pathname: "/university-topics", params: { packId, savedUnitId } } as never); };
  const next = () => { if (index + 1 >= session.length) return; setIndex((value) => value + 1); setSelected(null); setReflection(""); setComplete(false); };
  const freshSession = () => {
    if (unitIdParam || savedUnitIdParam) { router.replace({ pathname: "/university-topics", params: { packId } } as never); return; }
    const nextNonce = nonce + 1;
    haptic.medium();
    setNonce(nextNonce);
    setSession(selectUniversityTopicSession(packId, progress, 4, nextNonce));
    setIndex(0);
    setSelected(null);
    setReflection("");
    setComplete(false);
  };

  return <ScreenContainer className="px-5" edges={["top", "left", "right"]}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <Pressable onPress={() => router.back()} accessibilityRole="button"><Text style={[styles.back, { color: colors.primary }]}>‹ University study</Text></Pressable>
      <View style={styles.header}><View><Text style={[styles.eyebrow, { color: colors.primary }]}>{universityTopicSessionReasonLabel(current.reason)}</Text><Text style={[styles.title, { color: colors.foreground }]}>{pack.title}</Text></View><View style={[styles.progressPill, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={[styles.progressNumber, { color: colors.primary }]}>{index + 1}/{session.length}</Text><Text style={[styles.progressLabel, { color: colors.muted }]}>VARIED TOPICS</Text></View></View>
      <View style={[styles.sessionNote, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={[styles.sessionNoteText, { color: colors.muted }]}>{unitIdParam ? `This is one exact topic from ${topicTotal} local ${pack.title} units.` : savedUnitIdParam ? "This is one topic saved privately on this device." : `This four-topic session balances new learning, review needs, and saved work without repeating a topic.`} No topic choices leave this device.</Text><View style={styles.privateProgress}><Text style={[styles.privateProgressLabel, { color: colors.primary }]}>{packProgress.completed}/{topicTotal} COMPLETED</Text><Text style={[styles.privateProgressLabel, { color: colors.muted }]}>{packProgress.review} TO REVISIT · {packProgress.saved} SAVED</Text></View></View>
      <View style={[styles.searchSheet, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={[styles.eyebrow, { color: colors.primary }]}>FIND A LOCAL TOPIC</Text><TextInput value={query} onChangeText={setQuery} placeholder={`Search ${pack.title} topics`} placeholderTextColor={colors.muted} returnKeyType="search" style={[styles.searchInput, { borderColor: colors.border, backgroundColor: colors.background, color: colors.foreground }]} accessibilityLabel={`Search local ${pack.title} topics`} />{query.trim() && !hasSearchQuery ? <Text style={[styles.searchState, { color: colors.muted }]}>Enter at least two letters to search this pack.</Text> : null}{hasSearchQuery && searchResults.length === 0 ? <Text style={[styles.searchState, { color: colors.muted }]}>No local topic matches “{query.trim()}”. Try a word from a topic name or cue.</Text> : null}{searchResults.map((result) => <TopicLink key={result.id} unit={result} colors={colors} onPress={() => openSearchResult(result.id)} />)}</View>
      <View style={[styles.searchSheet, { borderColor: colors.border, backgroundColor: colors.surface }]}><View style={styles.savedHeader}><Text style={[styles.eyebrow, { color: colors.primary }]}>PRIVATE SAVED TOPICS</Text><Text style={[styles.savedCount, { color: colors.muted }]}>{savedTopics.length} LOCAL</Text></View>{savedTopics.length === 0 ? <Text style={[styles.searchState, { color: colors.muted }]}>Save a topic to keep a private return point here.</Text> : savedTopics.map((savedTopic) => <TopicLink key={savedTopic.id} unit={savedTopic} colors={colors} onPress={() => openSavedTopic(savedTopic.id)} />)}</View>
      <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface }]}><View style={styles.meta}><View><Text style={[styles.eyebrow, { color: colors.primary }]}>{universityTopicModeLabel(unit.mode)}</Text><Text style={[styles.cue, { color: colors.muted }]}>{unit.cue}</Text></View><Pressable onPress={() => { haptic.light(); void persist(toggleUniversityTopicSaved(progress, unit.id)); }} accessibilityRole="button" style={[styles.save, { borderColor: saved ? colors.primary : colors.border, backgroundColor: saved ? colors.primary : colors.background }]}><Text style={[styles.saveText, { color: saved ? colors.background : colors.primary }]}>{saved ? "★ Saved" : "☆ Save"}</Text></Pressable></View><Text style={[styles.activityTitle, { color: colors.foreground }]}>{unit.title}</Text><View style={styles.speechRow}><Pressable onPress={() => void listenToTopic()} accessibilityRole="button" style={[styles.speechAction, { borderColor: colors.primary }]}><Text style={[styles.speechActionText, { color: colors.primary }]}>Listen to topic</Text></Pressable><Pressable onPress={() => void stopRoundsSpeech(Speech)} accessibilityRole="button"><Text style={[styles.stopSpeech, { color: colors.muted }]}>Stop</Text></Pressable></View>{unit.boundaryNote ? <Text style={[styles.boundary, { color: colors.muted }]}>{unit.boundaryNote}</Text> : null}{isReflection ? <ReflectionUnit unit={unit} draft={reflection} complete={complete} colors={colors} onChange={setReflection} onSave={saveReflection} /> : <ChoiceUnit unit={unit} selected={selected} complete={complete} correct={correct} colors={colors} onChoose={choose} />}</View>
      {complete ? <Pressable onPress={next} disabled={index + 1 >= session.length} accessibilityRole="button" style={({ pressed }) => [styles.nextButton, { backgroundColor: index + 1 >= session.length ? colors.border : colors.primary }, pressed && index + 1 < session.length && styles.pressed]}><Text style={[styles.nextText, { color: index + 1 >= session.length ? colors.muted : colors.background }]}>{index + 1 >= session.length ? "Session completed" : "Next varied topic"}</Text></Pressable> : null}
      {complete && index + 1 >= session.length ? <Pressable onPress={freshSession} accessibilityRole="button" style={({ pressed }) => [styles.freshButton, { borderColor: colors.primary }, pressed && styles.pressed]}><Text style={[styles.freshText, { color: colors.primary }]}>{unitIdParam || savedUnitIdParam ? "Return to varied topics" : "Build another varied session"}</Text></Pressable> : null}
    </ScrollView>
  </ScreenContainer>;
}

function TopicLink({ unit, colors, onPress }: { unit: UniversityTopicUnit; colors: ReturnType<typeof useColors>; onPress: () => void }) {
  return <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Open ${unit.title}`} style={({ pressed }) => [styles.searchResult, { borderColor: colors.border, backgroundColor: colors.background }, pressed && styles.pressed]}><View style={styles.searchResultCopy}><Text style={[styles.searchResultTitle, { color: colors.foreground }]}>{unit.title}</Text><Text numberOfLines={1} style={[styles.searchResultMeta, { color: colors.muted }]}>{unit.cue} · {universityTopicModeLabel(unit.mode)}</Text></View><Text style={[styles.searchArrow, { color: colors.primary }]}>›</Text></Pressable>;
}

function ChoiceUnit({ unit, selected, complete, correct, colors, onChoose }: { unit: UniversityTopicUnit; selected: string | null; complete: boolean; correct: boolean; colors: ReturnType<typeof useColors>; onChoose: (option: string) => void }) {
  return <View style={styles.stack}><Text style={[styles.prompt, { color: colors.foreground }]}>{unit.prompt}</Text>{unit.options?.map((option) => <Pressable key={option} disabled={complete} onPress={() => onChoose(option)} accessibilityRole="button" style={({ pressed }) => [styles.option, { borderColor: selected === option ? (correct ? colors.success : colors.error) : colors.border, backgroundColor: colors.background }, pressed && !complete && styles.pressed]}><Text style={[styles.optionText, { color: colors.foreground }]}>{option}</Text></Pressable>)}{complete ? <View style={[styles.feedback, { borderColor: correct ? colors.success : colors.warning, backgroundColor: colors.background }]}><Text style={[styles.feedbackTitle, { color: correct ? colors.success : colors.warning }]}>{correct ? "Topic matched" : "Keep this topic in review"}</Text><Text style={[styles.body, { color: colors.muted }]}>{unit.explanation}</Text></View> : null}</View>;
}

function ReflectionUnit({ unit, draft, complete, colors, onChange, onSave }: { unit: UniversityTopicUnit; draft: string; complete: boolean; colors: ReturnType<typeof useColors>; onChange: (value: string) => void; onSave: () => void }) {
  return <View style={styles.stack}><Text style={[styles.prompt, { color: colors.foreground }]}>{unit.reflectionPrompt ?? unit.prompt}</Text><TextInput value={draft} onChangeText={onChange} editable={!complete} multiline placeholder="Write a private reflection" placeholderTextColor={colors.muted} style={[styles.input, { borderColor: colors.border, backgroundColor: colors.background, color: colors.foreground }]} accessibilityLabel="Private university topic reflection" />{!complete ? <Pressable onPress={onSave} accessibilityRole="button" style={({ pressed }) => [styles.nextButton, { backgroundColor: colors.primary }, pressed && styles.pressed]}><Text style={[styles.nextText, { color: colors.background }]}>Record private reflection</Text></Pressable> : <View style={[styles.feedback, { borderColor: colors.success, backgroundColor: colors.background }]}><Text style={[styles.feedbackTitle, { color: colors.success }]}>Reflection recorded</Text><Text style={[styles.body, { color: colors.muted }]}>{unit.explanation}</Text></View>}</View>;
}

function Unavailable({ colors, router, title }: { colors: ReturnType<typeof useColors>; router: ReturnType<typeof useRouter>; title: string }) {
  return <ScreenContainer className="p-6 justify-center"><Text style={[styles.title, { color: colors.foreground }]}>{title}</Text><Pressable onPress={() => router.back()} accessibilityRole="button"><Text style={[styles.back, { color: colors.primary }]}>Go back</Text></Pressable></ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { paddingTop: 18, paddingBottom: 38, gap: 13 }, back: { fontSize: 14, fontWeight: "900" }, header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 14 }, eyebrow: { fontSize: 10, letterSpacing: 1.2, fontWeight: "900" }, title: { fontFamily: "Georgia", fontSize: 27, lineHeight: 34, fontWeight: "700", maxWidth: 244 }, progressPill: { borderWidth: 1, borderRadius: 15, alignItems: "center", paddingHorizontal: 10, paddingVertical: 8 }, progressNumber: { fontSize: 16, fontWeight: "900" }, progressLabel: { fontSize: 8, letterSpacing: 0.6, fontWeight: "900", marginTop: 1 }, sessionNote: { borderWidth: 1, borderRadius: 16, padding: 13, gap: 9 }, sessionNoteText: { fontSize: 12, lineHeight: 18 }, privateProgress: { flexDirection: "row", flexWrap: "wrap", gap: 9 }, privateProgressLabel: { fontSize: 9, lineHeight: 13, letterSpacing: 0.6, fontWeight: "900" }, searchSheet: { borderWidth: 1, borderRadius: 18, padding: 13, gap: 8 }, searchInput: { minHeight: 46, borderWidth: 1, borderRadius: 13, paddingHorizontal: 12, fontSize: 13 }, searchState: { fontSize: 11, lineHeight: 16 }, searchResult: { minHeight: 57, borderWidth: 1, borderRadius: 13, paddingHorizontal: 11, paddingVertical: 9, flexDirection: "row", alignItems: "center", gap: 8 }, searchResultCopy: { flex: 1, gap: 2 }, searchResultTitle: { fontSize: 13, lineHeight: 18, fontWeight: "900" }, searchResultMeta: { fontSize: 9, lineHeight: 13, fontWeight: "700" }, searchArrow: { fontSize: 23, fontWeight: "300" }, savedHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }, savedCount: { fontSize: 9, letterSpacing: 0.8, fontWeight: "900" }, card: { borderWidth: 1, borderRadius: 22, padding: 16, gap: 12 }, meta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 }, cue: { fontSize: 11, lineHeight: 16, marginTop: 2 }, save: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 7 }, saveText: { fontSize: 11, fontWeight: "900" }, activityTitle: { fontSize: 21, lineHeight: 28, fontWeight: "900" }, speechRow: { flexDirection: "row", alignItems: "center", gap: 13 }, speechAction: { minHeight: 34, borderWidth: 1, borderRadius: 11, paddingHorizontal: 11, justifyContent: "center" }, speechActionText: { fontSize: 11, fontWeight: "900" }, stopSpeech: { fontSize: 12, fontWeight: "800" }, boundary: { fontSize: 11, lineHeight: 16 }, stack: { gap: 10 }, prompt: { fontSize: 16, lineHeight: 23, fontWeight: "900" }, option: { borderWidth: 1, borderRadius: 15, padding: 13 }, optionText: { fontSize: 14, lineHeight: 20, fontWeight: "700" }, feedback: { borderWidth: 1, borderRadius: 15, padding: 14, gap: 5 }, feedbackTitle: { fontSize: 14, fontWeight: "900" }, body: { fontSize: 13, lineHeight: 19 }, input: { minHeight: 116, borderWidth: 1, borderRadius: 15, padding: 13, textAlignVertical: "top", fontSize: 14, lineHeight: 20 }, nextButton: { minHeight: 53, borderRadius: 16, alignItems: "center", justifyContent: "center" }, nextText: { fontSize: 15, fontWeight: "900" }, freshButton: { minHeight: 47, borderWidth: 1, borderRadius: 15, alignItems: "center", justifyContent: "center" }, freshText: { fontSize: 14, fontWeight: "900" }, pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
});

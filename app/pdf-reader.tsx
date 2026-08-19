import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Speech from "expo-speech";

import { ScreenContainer } from "@/components/screen-container";
import { useRoundsVoice } from "@/hooks/use-rounds-voice";
import { useAuthSession } from "@/lib/auth-session";
import { loadPdfReaderCache, loadPdfReaderProgress, savePdfReaderCache, savePdfReaderProgress, type CachedPdfReader } from "@/lib/pdf-reader-cache";
import { preparePdfSectionSpeech, stopRoundsSpeech } from "@/lib/voice";
import { trpc } from "@/lib/trpc";
import { searchReadingSections } from "@/shared/pdf-reader";
import type { LearnerMaterialPractice } from "@/shared/pdf-practice";
import { useColors } from "@/hooks/use-colors";

export default function PdfReaderScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user } = useAuthSession();
  const { materialId: rawMaterialId, section: rawSection } = useLocalSearchParams<{ materialId?: string; section?: string }>();
  const materialId = Number(rawMaterialId);
  const initialSection = Math.max(0, Number.parseInt(rawSection ?? "0", 10) || 0);
  const readerQuery = trpc.studyMaterials.reader.useQuery({ materialId }, { enabled: Number.isInteger(materialId) && materialId > 0 });
  const reindex = trpc.studyMaterials.reindexReader.useMutation({ onSuccess: () => void readerQuery.refetch() });
  const originalQuery = trpc.studyMaterials.openOriginal.useQuery({ materialId }, { enabled: false });
  const generatePracticeMutation = trpc.studyMaterials.generatePractice.useMutation();
  const [cached, setCached] = useState<CachedPdfReader | null>(null);
  const [position, setPosition] = useState(initialSection);
  const [saved, setSaved] = useState<Set<number>>(new Set());
  const [query, setQuery] = useState("");
  const [isNarrating, setIsNarrating] = useState(false);
  const [practice, setPractice] = useState<LearnerMaterialPractice | null>(null);
  const [revealedAnswers, setRevealedAnswers] = useState<Set<number>>(new Set());
  const { speechOptions } = useRoundsVoice();

  useEffect(() => {
    if (!user || !materialId) return;
    void Promise.all([loadPdfReaderCache(user.id, materialId), loadPdfReaderProgress(user.id, materialId)]).then(([content, progress]) => {
      setCached(content); setPosition(Math.max(initialSection, progress.position)); setSaved(progress.saved);
    });
  }, [user, materialId, initialSection]);

  useEffect(() => {
    if (!user || !readerQuery.data) return;
    const { material, sections } = readerQuery.data;
    const cacheable = { material, sections };
    setCached({ ...cacheable, cachedAt: new Date().toISOString() });
    void savePdfReaderCache(user.id, materialId, cacheable);
  }, [user, materialId, readerQuery.data]);

  useEffect(() => () => { void stopRoundsSpeech(Speech); }, []);

  const reader = readerQuery.data ?? cached;
  const sections = useMemo(() => reader?.sections ?? [], [reader]);
  const safePosition = Math.min(Math.max(0, position), Math.max(0, sections.length - 1));
  const activeSection = sections[safePosition];
  const matches = useMemo(() => query.trim() ? searchReadingSections(sections, query) : [], [sections, query]);
  const offline = !readerQuery.data && Boolean(cached);

  const moveTo = (nextPosition: number) => {
    const next = Math.min(Math.max(0, nextPosition), Math.max(0, sections.length - 1));
    void stopRoundsSpeech(Speech);
    setIsNarrating(false);
    setPractice(null);
    setRevealedAnswers(new Set());
    setPosition(next);
    if (user) void savePdfReaderProgress(user.id, materialId, next, saved);
  };
  const toggleSaved = () => {
    const next = new Set(saved);
    if (next.has(safePosition)) next.delete(safePosition); else next.add(safePosition);
    setSaved(next);
    if (user) void savePdfReaderProgress(user.id, materialId, safePosition, next);
  };
  const openOriginal = async () => {
    try {
      const response = await originalQuery.refetch();
      if (!response.data?.url) throw new Error("The original PDF is not available right now.");
      await WebBrowser.openBrowserAsync(response.data.url, { presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET });
    } catch (error) { Alert.alert("Original PDF unavailable", error instanceof Error ? error.message : "Try again while connected."); }
  };
  const readActiveSection = async () => {
    if (!activeSection) return;
    await stopRoundsSpeech(Speech);
    if (!speechOptions) {
      Alert.alert("Choose an English voice", "Install or select an English device voice in Rounds Settings before listening to this passage.");
      return;
    }
    setIsNarrating(true);
    Speech.speak(preparePdfSectionSpeech(activeSection.heading, activeSection.content), {
      ...speechOptions,
      onDone: () => setIsNarrating(false),
      onStopped: () => setIsNarrating(false),
      onError: () => setIsNarrating(false),
    });
  };
  const stopNarration = async () => {
    await stopRoundsSpeech(Speech);
    setIsNarrating(false);
  };
  const createPractice = async () => {
    if (!activeSection) return;
    try {
      const generated = await generatePracticeMutation.mutateAsync({ materialId, sectionPosition: activeSection.position });
      setPractice(generated);
      setRevealedAnswers(new Set());
    } catch (error) {
      Alert.alert("Practice unavailable", error instanceof Error ? error.message : "Try again while connected.");
    }
  };
  const toggleAnswer = (questionIndex: number) => {
    const next = new Set(revealedAnswers);
    if (next.has(questionIndex)) next.delete(questionIndex); else next.add(questionIndex);
    setRevealedAnswers(next);
  };

  if (!Number.isInteger(materialId) || materialId <= 0) return <ScreenContainer className="p-6 justify-center"><Text style={[styles.title, { color: colors.foreground }]}>Choose a private PDF first.</Text><Pressable onPress={() => router.replace("/study-materials" as never)}><Text style={[styles.link, { color: colors.primary }]}>Open study materials</Text></Pressable></ScreenContainer>;
  if (readerQuery.isLoading && !cached) return <ScreenContainer className="items-center justify-center"><ActivityIndicator color={colors.primary} /><Text style={[styles.loading, { color: colors.muted }]}>Preparing your private reader…</Text></ScreenContainer>;
  if (!reader) return <ScreenContainer className="p-6 justify-center"><Text style={[styles.title, { color: colors.foreground }]}>Reader unavailable.</Text><Text style={[styles.body, { color: colors.muted }]}>Connect once to prepare this private PDF for reading.</Text><Pressable onPress={() => void readerQuery.refetch()}><Text style={[styles.link, { color: colors.primary }]}>Try again</Text></Pressable></ScreenContainer>;

  const progress = sections.length ? Math.round(((safePosition + 1) / sections.length) * 100) : 0;
  return <ScreenContainer className="px-5" edges={["top", "left", "right"]}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <View style={styles.header}><Pressable onPress={() => router.back()} accessibilityRole="button"><Text style={[styles.back, { color: colors.primary }]}>‹ Study materials</Text></Pressable><View style={styles.headerRow}><View style={styles.grow}><Text style={[styles.eyebrow, { color: colors.primary }]}>PRIVATE PDF READER</Text><Text numberOfLines={2} style={[styles.title, { color: colors.foreground }]}>{reader.material.title}</Text></View><Pressable onPress={() => void openOriginal()} accessibilityRole="button"><Text style={[styles.original, { color: colors.primary }]}>Original PDF</Text></Pressable></View><Text style={[styles.sub, { color: colors.muted }]}>{offline ? "Offline copy · this reader was cached on this device." : "Private to your Rounds account · text reader and topic search."}</Text></View>
    <View style={[styles.progressCard, { borderColor: colors.border, backgroundColor: colors.surface }]}><View style={styles.progressRow}><Text style={[styles.progressText, { color: colors.foreground }]}>{sections.length ? `Section ${safePosition + 1} of ${sections.length}` : "Text extraction unavailable"}</Text><Text style={[styles.progressText, { color: colors.muted }]}>{progress}% read · {saved.size} saved</Text></View><View style={[styles.progressTrack, { backgroundColor: colors.border }]}><View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${progress}%` }]} /></View></View>
    <View style={[styles.searchCard, { borderColor: colors.border }]}><TextInput value={query} onChangeText={setQuery} placeholder="Search a topic, concept, or term" placeholderTextColor={colors.muted} style={[styles.searchInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.surface }]} accessibilityLabel="Search this private PDF" />{query.trim() ? <View style={styles.results}><Text style={[styles.resultsLabel, { color: colors.muted }]}>{matches.length ? `${matches.length} relevant passages` : "No matching passage yet"}</Text>{matches.map((match) => <Pressable key={match.position} onPress={() => { moveTo(match.position); setQuery(""); }} accessibilityRole="button" style={[styles.result, { borderColor: colors.border }]}><Text style={[styles.resultHeading, { color: colors.foreground }]}>{match.heading}</Text><Text numberOfLines={2} style={[styles.resultCopy, { color: colors.muted }]}>{match.content}</Text></Pressable>)}</View> : null}</View>
    {!sections.length ? <View style={[styles.empty, { borderColor: colors.warning, backgroundColor: colors.surface }]}><Text style={[styles.emptyTitle, { color: colors.foreground }]}>This PDF has no searchable text yet.</Text><Text style={[styles.body, { color: colors.muted }]}>It may be a scanned image or have restricted text. You can try preparing it again while connected; the original PDF can still be opened separately.</Text><Pressable onPress={() => reindex.mutate({ materialId })} disabled={reindex.isPending} style={[styles.primary, { backgroundColor: colors.primary }]}><Text style={[styles.primaryText, { color: colors.background }]}>{reindex.isPending ? "Preparing reader…" : "Prepare searchable reader"}</Text></Pressable></View> : <><View style={[styles.readerCard, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={[styles.sectionHeading, { color: colors.primary }]}>{activeSection?.heading}</Text><Text style={[styles.readerText, { color: colors.foreground }]}>{activeSection?.content}</Text></View><View style={[styles.listenCard, { borderColor: colors.primary, backgroundColor: colors.surface }]}><View style={styles.listenCopy}><Text style={[styles.listenTitle, { color: colors.foreground }]}>{isNarrating ? "Reading this section" : "Listen to this section"}</Text><Text style={[styles.listenSub, { color: colors.muted }]}>Uses your saved Rounds speech pace. On iPhone, turn off Silent Mode to hear speech.</Text></View>{isNarrating ? <Pressable onPress={() => void stopNarration()} accessibilityRole="button" accessibilityLabel="Stop reading this PDF section" style={[styles.listenAction, { borderColor: colors.border }]}><Text style={[styles.listenActionText, { color: colors.foreground }]}>Stop</Text></Pressable> : <Pressable onPress={() => void readActiveSection()} accessibilityRole="button" accessibilityLabel="Read this PDF section aloud" style={[styles.listenAction, { backgroundColor: colors.primary }]}><Text style={[styles.listenActionText, { color: colors.background }]}>Read aloud</Text></Pressable>}</View><View style={[styles.practiceCard, { borderColor: colors.border, backgroundColor: colors.surface }]}><View style={styles.practiceHeader}><View style={styles.listenCopy}><Text style={[styles.practiceTitle, { color: colors.foreground }]}>Listen and practise from this PDF</Text><Text style={[styles.practiceSub, { color: colors.muted }]}>Creates three private study questions from this section only. It is not official Rounds or NCLEX content.</Text></View><Pressable onPress={() => void createPractice()} disabled={generatePracticeMutation.isPending} accessibilityRole="button" accessibilityLabel="Create private practice questions from this PDF section" style={[styles.practiceAction, { backgroundColor: colors.primary }, generatePracticeMutation.isPending && styles.dimmed]}><Text style={[styles.listenActionText, { color: colors.background }]}>{generatePracticeMutation.isPending ? "Creating…" : "Create 3"}</Text></Pressable></View>{practice?.source.sectionPosition === safePosition ? <View style={styles.practiceQuestions}><Text style={[styles.practiceCitation, { color: colors.muted }]}>Source: {practice.source.materialTitle} · {practice.source.sectionHeading}</Text>{practice.questions.map((item, questionIndex) => <View key={`${safePosition}-${questionIndex}`} style={[styles.practiceQuestion, { borderColor: colors.border }]}><Text style={[styles.practiceQuestionLabel, { color: colors.primary }]}>PRACTICE QUESTION {questionIndex + 1}</Text><Text style={[styles.practiceQuestionText, { color: colors.foreground }]}>{item.question}</Text><Pressable onPress={() => toggleAnswer(questionIndex)} accessibilityRole="button"><Text style={[styles.answerToggle, { color: colors.primary }]}>{revealedAnswers.has(questionIndex) ? "Hide source answer" : "Reveal source answer"}</Text></Pressable>{revealedAnswers.has(questionIndex) ? <View style={styles.answerBlock}><Text style={[styles.answerTitle, { color: colors.foreground }]}>Expected answer</Text><Text style={[styles.answerText, { color: colors.muted }]}>{item.expectedAnswer}</Text><Text style={[styles.answerTitle, { color: colors.foreground }]}>Why this is supported</Text><Text style={[styles.answerText, { color: colors.muted }]}>{item.rationale}</Text></View> : null}</View>)}</View> : null}</View><View style={styles.controls}><Pressable onPress={() => moveTo(safePosition - 1)} disabled={safePosition === 0} accessibilityRole="button" style={[styles.control, { borderColor: colors.border }, safePosition === 0 && styles.dimmed]}><Text style={[styles.controlText, { color: colors.foreground }]}>Previous</Text></Pressable><Pressable onPress={toggleSaved} accessibilityRole="button" style={[styles.control, { borderColor: saved.has(safePosition) ? colors.primary : colors.border }]}><Text style={[styles.controlText, { color: saved.has(safePosition) ? colors.primary : colors.foreground }]}>{saved.has(safePosition) ? "Saved" : "Save passage"}</Text></Pressable><Pressable onPress={() => moveTo(safePosition + 1)} disabled={safePosition >= sections.length - 1} accessibilityRole="button" style={[styles.control, { borderColor: colors.border }, safePosition >= sections.length - 1 && styles.dimmed]}><Text style={[styles.controlText, { color: colors.foreground }]}>Next</Text></Pressable></View>{saved.size ? <View style={[styles.savedCard, { borderColor: colors.border }]}><Text style={[styles.savedTitle, { color: colors.foreground }]}>Saved passages</Text>{[...saved].sort((a, b) => a - b).map((savedPosition) => <Pressable key={savedPosition} onPress={() => moveTo(savedPosition)} accessibilityRole="button"><Text style={[styles.link, { color: colors.primary }]}>{sections[savedPosition]?.heading ?? `Section ${savedPosition + 1}`}</Text></Pressable>)}</View> : null}</>}
  </ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { paddingTop: 18, paddingBottom: 40, gap: 15 }, header: { gap: 6 }, headerRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }, grow: { flex: 1 }, back: { fontSize: 14, fontWeight: "800", marginBottom: 3 }, eyebrow: { fontSize: 10, letterSpacing: 1.6, fontWeight: "900" }, title: { fontFamily: "Georgia", fontSize: 29, lineHeight: 36, fontWeight: "700", marginTop: 3 }, original: { fontSize: 12, fontWeight: "900", paddingTop: 5 }, sub: { fontSize: 13, lineHeight: 19 }, progressCard: { borderWidth: 1, borderRadius: 17, padding: 14, gap: 9 }, progressRow: { flexDirection: "row", justifyContent: "space-between", gap: 10 }, progressText: { fontSize: 11, fontWeight: "800" }, progressTrack: { height: 7, borderRadius: 99, overflow: "hidden" }, progressFill: { height: "100%", borderRadius: 99 }, searchCard: { borderWidth: 1, borderRadius: 18, padding: 12, gap: 10 }, searchInput: { minHeight: 48, borderWidth: 1, borderRadius: 13, paddingHorizontal: 13, fontSize: 14 }, results: { gap: 8 }, resultsLabel: { fontSize: 12, fontWeight: "800" }, result: { borderWidth: 1, borderRadius: 13, padding: 11, gap: 3 }, resultHeading: { fontSize: 13, fontWeight: "900" }, resultCopy: { fontSize: 12, lineHeight: 17 }, readerCard: { borderWidth: 1, borderRadius: 20, padding: 18, gap: 10 }, sectionHeading: { fontSize: 12, fontWeight: "900", letterSpacing: 0.6 }, readerText: { fontFamily: "Georgia", fontSize: 18, lineHeight: 30 }, listenCard: { borderWidth: 1, borderRadius: 17, padding: 13, flexDirection: "row", alignItems: "center", gap: 10 }, listenCopy: { flex: 1, gap: 3 }, listenTitle: { fontSize: 14, fontWeight: "900" }, listenSub: { fontSize: 11, lineHeight: 16 }, listenAction: { minHeight: 39, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" }, listenActionText: { fontSize: 12, fontWeight: "900" }, practiceCard: { borderWidth: 1, borderRadius: 17, padding: 13, gap: 12 }, practiceHeader: { flexDirection: "row", alignItems: "center", gap: 10 }, practiceTitle: { fontSize: 14, fontWeight: "900" }, practiceSub: { fontSize: 11, lineHeight: 16 }, practiceAction: { minHeight: 39, paddingHorizontal: 12, borderRadius: 12, alignItems: "center", justifyContent: "center" }, practiceQuestions: { gap: 9 }, practiceCitation: { fontSize: 10, lineHeight: 14, fontWeight: "700" }, practiceQuestion: { borderWidth: 1, borderRadius: 14, padding: 12, gap: 7 }, practiceQuestionLabel: { fontSize: 10, letterSpacing: 0.8, fontWeight: "900" }, practiceQuestionText: { fontSize: 14, lineHeight: 20, fontWeight: "800" }, answerToggle: { fontSize: 12, fontWeight: "900" }, answerBlock: { gap: 3, paddingTop: 3 }, answerTitle: { fontSize: 12, fontWeight: "900", marginTop: 3 }, answerText: { fontSize: 12, lineHeight: 18 }, controls: { flexDirection: "row", gap: 7 }, control: { flex: 1, minHeight: 43, borderWidth: 1, borderRadius: 13, justifyContent: "center", alignItems: "center", paddingHorizontal: 7 }, controlText: { fontSize: 12, fontWeight: "900" }, dimmed: { opacity: 0.4 }, savedCard: { borderWidth: 1, borderRadius: 17, padding: 14, gap: 7 }, savedTitle: { fontSize: 14, fontWeight: "900" }, link: { fontSize: 13, fontWeight: "900", marginTop: 8 }, empty: { borderWidth: 1, borderRadius: 20, padding: 17, gap: 8 }, emptyTitle: { fontSize: 17, fontWeight: "900" }, body: { fontSize: 14, lineHeight: 21 }, primary: { minHeight: 50, borderRadius: 15, alignItems: "center", justifyContent: "center", marginTop: 4 }, primaryText: { fontSize: 14, fontWeight: "900" }, loading: { marginTop: 12, fontSize: 14 } });

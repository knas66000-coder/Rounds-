import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { advanceCaseStep, finishCaseChain, loadCaseChainProgress, recordCaseDecision, saveCaseChainProgress, type CaseChainProgress } from "@/lib/case-chain-store";
import { caseChainForId } from "@/shared/case-chains";

export default function CaseChainScreen() {
  const colors = useColors();
  const router = useRouter();
  const { chainId = "" } = useLocalSearchParams<{ chainId?: string }>();
  const chain = caseChainForId(chainId);
  const [progress, setProgress] = useState<CaseChainProgress | null>(null);
  const [reflection, setReflection] = useState("");

  useEffect(() => {
    if (!chain) return;
    void loadCaseChainProgress(chain.id).then((stored) => {
      setProgress(stored);
      setReflection(stored.reflection);
    });
  }, [chain]);

  const save = async (next: CaseChainProgress) => {
    setProgress(next);
    await saveCaseChainProgress(next);
  };

  if (!chain) return <ScreenContainer className="p-6 justify-center"><Text style={[styles.title, { color: colors.foreground }]}>This learning case is unavailable.</Text><Pressable onPress={() => router.replace("/course-packs" as never)}><Text style={[styles.link, { color: colors.primary }]}>Return to Course Packs</Text></Pressable></ScreenContainer>;
  if (!progress) return <ScreenContainer className="p-6 justify-center"><Text style={[styles.body, { color: colors.muted }]}>Opening your saved case progress…</Text></ScreenContainer>;

  const step = chain.steps[progress.activeStepIndex];
  const answer = step ? progress.decisions[step.id] : undefined;
  const correct = step ? answer === step.bestOption : false;
  const complete = Boolean(progress.completedAt);
  const choose = (option: string) => {
    if (!step || answer) return;
    void save(recordCaseDecision(progress, step.id, option));
  };
  const continueCase = () => {
    if (!step) return;
    void save(advanceCaseStep(progress, chain));
  };
  const saveReflection = () => {
    if (!reflection.trim() || complete) return;
    void save(finishCaseChain(progress, reflection));
  };

  return <ScreenContainer className="px-5" edges={["top", "left", "right"]}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><Pressable onPress={() => router.back()} accessibilityRole="button"><Text style={[styles.back, { color: colors.primary }]}>‹ Course packs</Text></Pressable><Text style={[styles.eyebrow, { color: colors.primary }]}>{chain.eyebrow}</Text><Text style={[styles.title, { color: colors.foreground }]}>{chain.title}</Text><Text style={[styles.body, { color: colors.muted }]}>{chain.summary}</Text><View style={[styles.progress, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={[styles.progressText, { color: colors.primary }]}>{complete ? "CASE COMPLETE" : `STEP ${Math.min(progress.activeStepIndex + 1, chain.steps.length)} OF ${chain.steps.length}`}</Text><Text style={[styles.progressCopy, { color: colors.muted }]}>{complete ? "Your private reflection is saved on this device." : "Choose a response, review the feedback, then continue."}</Text></View>{step ? <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={[styles.stepTitle, { color: colors.foreground }]}>{step.title}</Text><View style={[styles.situation, { borderColor: colors.border, backgroundColor: colors.background }]}><Text style={[styles.body, { color: colors.muted }]}>{step.situation}</Text>{chain.boundaryNote ? <Text style={[styles.note, { color: colors.muted }]}>{chain.boundaryNote}</Text> : null}</View><Text style={[styles.prompt, { color: colors.foreground }]}>{step.prompt}</Text>{step.options.map((option) => <Pressable key={option} disabled={Boolean(answer)} onPress={() => choose(option)} accessibilityRole="button" style={({ pressed }) => [styles.option, { borderColor: answer === option ? (correct ? colors.success : colors.error) : colors.border, backgroundColor: colors.background }, pressed && !answer && styles.pressed]}><Text style={[styles.optionText, { color: colors.foreground }]}>{option}</Text></Pressable>)}{answer ? <View style={[styles.feedback, { borderColor: correct ? colors.success : colors.warning, backgroundColor: colors.background }]}><Text style={[styles.feedbackTitle, { color: correct ? colors.success : colors.warning }]}>{correct ? "Decision matched" : "Review the linked decision"}</Text><Text style={[styles.body, { color: colors.muted }]}>{step.explanation}</Text><Pressable onPress={continueCase} accessibilityRole="button" style={[styles.primaryButton, { backgroundColor: colors.primary }]}><Text style={[styles.primaryText, { color: colors.background }]}>{progress.activeStepIndex + 1 >= chain.steps.length ? "Continue to reflection" : "Continue to next step"}</Text></Pressable></View> : null}</View> : <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={[styles.stepTitle, { color: colors.foreground }]}>Private reflection</Text><Text style={[styles.body, { color: colors.muted }]}>{chain.reflectionPrompt}</Text><TextInput value={reflection} onChangeText={setReflection} editable={!complete} multiline placeholder="Write a private reflection" placeholderTextColor={colors.muted} style={[styles.input, { borderColor: colors.border, backgroundColor: colors.background, color: colors.foreground }]} accessibilityLabel="Private case reflection" />{complete ? <View style={[styles.feedback, { borderColor: colors.success, backgroundColor: colors.background }]}><Text style={[styles.feedbackTitle, { color: colors.success }]}>Case saved locally</Text><Text style={[styles.body, { color: colors.muted }]}>Rounds records your progress and reflection on this device. It is not an institutional grade.</Text></View> : <Pressable onPress={saveReflection} accessibilityRole="button" style={[styles.primaryButton, { backgroundColor: colors.primary }]}><Text style={[styles.primaryText, { color: colors.background }]}>Save reflection and finish</Text></Pressable>}</View>}</ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { paddingTop: 19, paddingBottom: 40, gap: 12 }, back: { fontSize: 14, fontWeight: "900" }, eyebrow: { fontSize: 10, letterSpacing: 1.4, fontWeight: "900" }, title: { fontFamily: "Georgia", fontSize: 29, lineHeight: 37, fontWeight: "700" }, body: { fontSize: 14, lineHeight: 21 }, link: { fontSize: 14, fontWeight: "900", marginTop: 16 }, progress: { borderWidth: 1, borderRadius: 16, padding: 13, gap: 3 }, progressText: { fontSize: 11, fontWeight: "900", letterSpacing: 1 }, progressCopy: { fontSize: 12, lineHeight: 17 }, card: { borderWidth: 1, borderRadius: 22, padding: 17, gap: 11 }, stepTitle: { fontSize: 20, lineHeight: 27, fontWeight: "900" }, situation: { borderWidth: 1, borderRadius: 15, padding: 13, gap: 5 }, note: { fontSize: 11, lineHeight: 16, fontStyle: "italic" }, prompt: { fontSize: 16, lineHeight: 23, fontWeight: "900" }, option: { borderWidth: 1, borderRadius: 15, padding: 13 }, optionText: { fontSize: 14, lineHeight: 20, fontWeight: "700" }, feedback: { borderWidth: 1, borderRadius: 15, padding: 14, gap: 6 }, feedbackTitle: { fontSize: 14, fontWeight: "900" }, primaryButton: { minHeight: 50, borderRadius: 15, alignItems: "center", justifyContent: "center", marginTop: 3 }, primaryText: { fontSize: 14, fontWeight: "900" }, input: { minHeight: 124, borderWidth: 1, borderRadius: 15, padding: 13, textAlignVertical: "top", fontSize: 14, lineHeight: 20 }, pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
});

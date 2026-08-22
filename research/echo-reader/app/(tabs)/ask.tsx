import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { type DocumentAnswer, answerFromLocalDocument } from "@/lib/document-assistant";
import type { LocalDocument } from "@/lib/document-search";
import { loadLocalDocument } from "@/lib/local-document-store";
import { useColors } from "@/hooks/use-colors";

export default function AskScreen() {
  const colors = useColors();
  const router = useRouter();
  const [document, setDocument] = useState<LocalDocument | null>(null);
  const [request, setRequest] = useState("");
  const [answer, setAnswer] = useState<DocumentAnswer | null>(null);
  const [autoMode, setAutoMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      try {
        setDocument(await loadLocalDocument());
      } finally {
        setLoading(false);
      }
    };
    void restore();
  }, []);

  useEffect(() => {
    if (!autoMode || !document || request.trim().length < 3) return;
    const timer = setTimeout(() => setAnswer(answerFromLocalDocument(document, request)), 700);
    return () => clearTimeout(timer);
  }, [autoMode, document, request]);

  const askDocument = () => {
    if (!document || !request.trim()) return;
    setAnswer(answerFromLocalDocument(document, request));
  };

  if (loading) return <ScreenContainer className="items-center justify-center"><ActivityIndicator color={colors.primary} /></ScreenContainer>;

  if (!document) {
    return <ScreenContainer className="px-5" containerClassName="bg-background"><View style={styles.emptyPage}><View style={[styles.emptyIcon, { backgroundColor: "rgba(124,108,255,0.14)" }]}><MaterialIcons name="find-in-page" size={38} color={colors.primary} /></View><Text style={[styles.emptyTitle, { color: colors.foreground }]}>Load a document first</Text><Text style={[styles.emptyCopy, { color: colors.muted }]}>Ask searches only the PDF, TXT, or Markdown document you load into Echo Reader.</Text><Pressable onPress={() => router.replace("/")} style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.primary }, pressed && styles.pressed]}><MaterialIcons name="folder-open" size={19} color="#FFFFFF" /><Text style={styles.primaryText}>Open Reader</Text></Pressable></View></ScreenContainer>;
  }

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}><View style={[styles.iconBadge, { backgroundColor: "rgba(124,108,255,0.14)" }]}><MaterialIcons name="question-answer" size={22} color={colors.primary} /></View><View style={styles.headerCopy}><Text style={[styles.eyebrow, { color: colors.primary }]}>DOCUMENT-ONLY ASSISTANT</Text><Text style={[styles.title, { color: colors.foreground }]}>Ask Echo</Text></View><View style={[styles.localPill, { backgroundColor: colors.surface, borderColor: colors.border }]}><MaterialIcons name="lock" size={13} color={colors.success} /><Text style={[styles.localText, { color: colors.muted }]}>Local</Text></View></View>

        <View style={[styles.documentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><MaterialIcons name="description" size={20} color={colors.primary} /><View style={styles.documentCopy}><Text numberOfLines={1} style={[styles.documentTitle, { color: colors.foreground }]}>{document.title}</Text><Text style={[styles.documentMeta, { color: colors.muted }]}>{document.pageCount} page{document.pageCount === 1 ? "" : "s"} · {document.passages.length} local passages</Text></View></View>

        <View style={[styles.modeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={styles.modeCopy}><Text style={[styles.modeTitle, { color: colors.foreground }]}>Automatic lookup</Text><Text style={[styles.modeText, { color: colors.muted }]}>Search this document locally after you pause typing.</Text></View><Switch value={autoMode} onValueChange={setAutoMode} trackColor={{ false: colors.border, true: colors.primary }} thumbColor="#FFFFFF" /></View>

        <Text style={[styles.promptLabel, { color: colors.muted }]}>ASK ABOUT THIS DOCUMENT</Text>
        <View style={[styles.promptBox, { backgroundColor: colors.surface, borderColor: colors.border }]}><TextInput value={request} onChangeText={setRequest} multiline placeholder="For example: Look up installation requirements" placeholderTextColor={colors.muted} style={[styles.promptInput, { color: colors.foreground }]} textAlignVertical="top" /></View>
        <Pressable disabled={!request.trim()} onPress={askDocument} style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.primary, opacity: request.trim() ? 1 : 0.45 }, pressed && request.trim() && styles.pressed]}><MaterialIcons name="search" size={20} color="#FFFFFF" /><Text style={styles.primaryText}>Search my document</Text></Pressable>

        {!answer ? <View style={styles.examples}><Text style={[styles.examplesTitle, { color: colors.foreground }]}>Try a grounded request</Text><Text style={[styles.examplesCopy, { color: colors.muted }]}>“What does this document say about privacy?”{`\n`}“Look up the installation steps.”{`\n`}“Where is the requirements section?”</Text></View> : null}
        {answer ? <View style={[styles.answerCard, { backgroundColor: colors.surface, borderColor: answer.status === "grounded" ? colors.success : colors.border }]}><View style={styles.answerTopRow}><View style={[styles.answerStatus, { backgroundColor: answer.status === "grounded" ? "rgba(87,214,154,0.14)" : "rgba(255,196,91,0.14)" }]}><MaterialIcons name={answer.status === "grounded" ? "verified" : "search-off"} size={17} color={answer.status === "grounded" ? colors.success : colors.warning} /></View><Text style={[styles.answerState, { color: answer.status === "grounded" ? colors.success : colors.warning }]}>{answer.status === "grounded" ? "GROUNDED IN YOUR DOCUMENT" : "NO LOCAL EVIDENCE"}</Text></View><Text style={[styles.answerText, { color: colors.foreground }]}>{answer.answer}</Text>{answer.source ? <View style={[styles.sourceCard, { borderColor: colors.border }]}><View style={styles.sourceMeta}><Text style={[styles.sourceLabel, { color: colors.primary }]}>SOURCE · PAGE {answer.source.page}</Text><Text style={[styles.sourceLabel, { color: colors.muted }]}>LOCAL CONTEXT</Text></View><Text style={[styles.sourceText, { color: colors.muted }]}>{answer.searchResult?.excerpt ?? answer.source.text}</Text></View> : null}<View style={[styles.cloneNote, { backgroundColor: "rgba(79,209,197,0.09)" }]}><MaterialIcons name="record-voice-over" size={18} color={colors.success} /><Text style={[styles.cloneNoteText, { color: colors.muted }]}>Read in my voice is an optional local voice pack. Your private references and model files stay outside the repository.</Text></View><Pressable onPress={() => router.push("/studio")} style={({ pressed }) => [styles.previewButton, { borderColor: colors.success }, pressed && styles.pressed]}><MaterialIcons name="settings-voice" size={19} color={colors.success} /><Text style={[styles.previewButtonText, { color: colors.success }]}>Set up local voice pack</Text></Pressable></View> : null}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 20, paddingBottom: 32, gap: 15 }, emptyPage: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28, gap: 15 }, emptyIcon: { width: 76, height: 76, borderRadius: 25, alignItems: "center", justifyContent: "center" }, emptyTitle: { fontSize: 23, fontWeight: "800", textAlign: "center" }, emptyCopy: { fontSize: 14, lineHeight: 21, textAlign: "center" }, headerRow: { flexDirection: "row", alignItems: "center", gap: 10 }, iconBadge: { width: 43, height: 43, borderRadius: 14, alignItems: "center", justifyContent: "center" }, headerCopy: { flex: 1 }, eyebrow: { fontSize: 10, fontWeight: "800", letterSpacing: 1.3 }, title: { fontSize: 28, lineHeight: 34, fontWeight: "800", letterSpacing: -0.5 }, localPill: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 99, borderWidth: 1, paddingHorizontal: 9, paddingVertical: 6 }, localText: { fontSize: 11, fontWeight: "700" }, documentCard: { flexDirection: "row", gap: 10, alignItems: "center", borderWidth: 1, padding: 14, borderRadius: 17 }, documentCopy: { flex: 1 }, documentTitle: { fontSize: 14, fontWeight: "800" }, documentMeta: { fontSize: 12, marginTop: 3 }, modeCard: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 17, padding: 14, gap: 12 }, modeCopy: { flex: 1 }, modeTitle: { fontSize: 15, fontWeight: "800" }, modeText: { fontSize: 12, lineHeight: 17, marginTop: 3 }, promptLabel: { fontSize: 10, letterSpacing: 1.3, fontWeight: "800", marginTop: 4 }, promptBox: { minHeight: 100, borderWidth: 1, borderRadius: 18, padding: 13 }, promptInput: { minHeight: 74, fontSize: 16, lineHeight: 22, fontWeight: "500" }, primaryButton: { minHeight: 55, borderRadius: 18, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 }, primaryText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" }, examples: { paddingHorizontal: 5, gap: 5 }, examplesTitle: { fontSize: 15, fontWeight: "800" }, examplesCopy: { fontSize: 13, lineHeight: 20 }, answerCard: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 13 }, answerTopRow: { flexDirection: "row", alignItems: "center", gap: 8 }, answerStatus: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center" }, answerState: { fontSize: 10, fontWeight: "800", letterSpacing: 0.9 }, answerText: { fontSize: 17, lineHeight: 25, fontWeight: "700" }, sourceCard: { borderTopWidth: 1, paddingTop: 12, gap: 7 }, sourceMeta: { flexDirection: "row", justifyContent: "space-between" }, sourceLabel: { fontSize: 10, letterSpacing: 0.7, fontWeight: "800" }, sourceText: { fontSize: 13, lineHeight: 20, fontWeight: "500" }, cloneNote: { flexDirection: "row", gap: 9, borderRadius: 13, padding: 12 }, cloneNoteText: { flex: 1, fontSize: 12, lineHeight: 18 }, previewButton: { minHeight: 46, borderWidth: 1, borderRadius: 14, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 }, previewButtonText: { fontSize: 14, fontWeight: "800" }, pressed: { opacity: 0.84, transform: [{ scale: 0.98 }] },
});

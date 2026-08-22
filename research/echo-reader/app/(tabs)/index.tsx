import { MaterialIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";
import { extractTextFromPage, getPageCount, isAvailable as isPdfExtractorAvailable } from "expo-pdf-text-extract";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { createLocalDocument, type LocalDocument, searchLocalDocument } from "@/lib/document-search";
import { clearLocalDocument, loadLocalDocument, saveLocalDocument } from "@/lib/local-document-store";
import { useColors } from "@/hooks/use-colors";

type ReaderStatus = "ready" | "importing" | "indexed" | "error";

function documentKind(name: string, mimeType?: string | null): LocalDocument["kind"] | null {
  const extension = name.split(".").pop()?.toLowerCase();
  if (mimeType === "application/pdf" || extension === "pdf") return "pdf";
  if (extension === "md" || extension === "markdown") return "markdown";
  if (mimeType?.startsWith("text/") || extension === "txt") return "text";
  return null;
}

export default function ReaderScreen() {
  const colors = useColors();
  const [document, setDocument] = useState<LocalDocument | null>(null);
  const [status, setStatus] = useState<ReaderStatus>("ready");
  const [statusMessage, setStatusMessage] = useState("Choose a PDF, TXT, or Markdown file stored on your device.");
  const [query, setQuery] = useState("");
  const [selectedPassage, setSelectedPassage] = useState<string | null>(null);

  const results = useMemo(() => (document ? searchLocalDocument(document, query) : []), [document, query]);
  const activePassage = document?.passages.find((passage) => passage.id === selectedPassage) ?? null;

  useEffect(() => {
    const restoreLocalDocument = async () => {
      try {
        const restored = await loadLocalDocument();
        if (!restored) return;
        setDocument(restored);
        setSelectedPassage(restored.passages[0].id);
        setStatus("indexed");
        setStatusMessage(`${restored.pageCount} page${restored.pageCount === 1 ? "" : "s"} restored from private local storage.`);
      } catch {
        setStatusMessage("Choose a PDF, TXT, or Markdown file stored on your device.");
      }
    };
    void restoreLocalDocument();
  }, []);

  const importDocument = async () => {
    try {
      const picked = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "text/plain", "text/markdown"],
        copyToCacheDirectory: true,
      });
      if (picked.canceled) return;

      const asset = picked.assets[0];
      const kind = documentKind(asset.name, asset.mimeType);
      if (!kind) {
        setStatus("error");
        setStatusMessage("Choose a PDF, TXT, or Markdown file. No document was uploaded anywhere.");
        return;
      }

      setStatus("importing");
      setStatusMessage("Reading the document locally and creating a private search index…");
      let pages: string[] = [];

      if (kind === "pdf") {
        if (Platform.OS === "web" || !isPdfExtractorAvailable()) {
          throw new Error("PDF text extraction needs the custom mobile build. TXT and Markdown work in the preview.");
        }
        const pageCount = await getPageCount(asset.uri);
        for (let page = 1; page <= pageCount; page += 1) {
          pages.push(await extractTextFromPage(asset.uri, page));
        }
      } else if (Platform.OS === "web" && asset.file) {
        pages = [await asset.file.text()];
      } else {
        pages = [await new File(asset.uri).text()];
      }

      const nextDocument = createLocalDocument({ title: asset.name, kind, pages });
      if (nextDocument.passages.length === 0) {
        throw new Error("No readable text was found. Scanned PDFs need an offline OCR module, which is not part of this first release.");
      }

      setDocument(nextDocument);
      setSelectedPassage(nextDocument.passages[0]?.id ?? null);
      setQuery("");
      setStatus("indexed");
      setStatusMessage(`${nextDocument.pageCount} page${nextDocument.pageCount === 1 ? "" : "s"} indexed locally. Search stays on this device.`);
      await saveLocalDocument(nextDocument);
    } catch (error) {
      setStatus("error");
      setStatusMessage(error instanceof Error ? error.message : "This document could not be opened.");
    }
  };

  const clearDocument = () => {
    setDocument(null);
    setQuery("");
    setSelectedPassage(null);
    setStatus("ready");
    setStatusMessage("The local reader is ready for a new document.");
    void clearLocalDocument();
  };

  const showVoicePlaceholder = () => {
    Alert.alert(
      "Custom voice is in preparation",
      "This passage is selected for read-aloud. Voice output will use your locally trained custom model after the consented Ugandan English dataset is complete. The phone speech engine is not used.",
    );
  };

  const screenStateLabel = status === "importing" ? "Indexing locally" : document ? "Document ready" : "Private reader";

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <View style={styles.page}>
        <View style={styles.topbar}>
          <View style={styles.brandGroup}>
            <View style={styles.brandMark}>
              <MaterialIcons name="auto-stories" size={22} color="#7C6CFF" />
            </View>
            <View>
              <Text style={[styles.eyebrow, { color: colors.primary }]}>{screenStateLabel.toUpperCase()}</Text>
              <Text style={[styles.appName, { color: colors.foreground }]}>Echo Reader</Text>
            </View>
          </View>
          <View style={[styles.localPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <MaterialIcons name="lock" size={13} color={colors.success} />
            <Text style={[styles.localPillText, { color: colors.muted }]}>Local</Text>
          </View>
        </View>

        <View style={[styles.statusCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.statusIcon, { backgroundColor: status === "error" ? "rgba(255,122,138,0.15)" : "rgba(79,209,197,0.14)" }]}>
            {status === "importing" ? <ActivityIndicator color={colors.primary} /> : <MaterialIcons name={status === "error" ? "error-outline" : "shield"} size={21} color={status === "error" ? colors.error : colors.success} />}
          </View>
          <Text style={[styles.statusCopy, { color: colors.muted }]}>{statusMessage}</Text>
        </View>

        {!document ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.emptyIcon, { backgroundColor: "rgba(124,108,255,0.14)" }]}>
              <MaterialIcons name="picture-as-pdf" size={35} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Bring your own document</Text>
            <Text style={[styles.emptyCopy, { color: colors.muted }]}>Echo indexes the text of a digital PDF, TXT, or Markdown file directly on your phone. It does not upload the document.</Text>
            <Pressable onPress={importDocument} style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.primary }, pressed && styles.pressed]}>
              <MaterialIcons name="folder-open" size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Choose document</Text>
            </Pressable>
            <Text style={[styles.buildNote, { color: colors.muted }]}>PDF extraction is available in the custom mobile build. The preview supports TXT and Markdown import.</Text>
          </View>
        ) : (
          <>
            <View style={styles.documentHeader}>
              <View style={styles.documentNameWrap}>
                <Text numberOfLines={1} style={[styles.documentName, { color: colors.foreground }]}>{document.title}</Text>
                <Text style={[styles.documentMeta, { color: colors.muted }]}>{document.passages.length} passages · {document.pageCount} page{document.pageCount === 1 ? "" : "s"}</Text>
              </View>
              <Pressable accessibilityLabel="Remove loaded document" onPress={clearDocument} style={({ pressed }) => [styles.iconButton, { borderColor: colors.border }, pressed && styles.pressed]}>
                <MaterialIcons name="close" size={21} color={colors.foreground} />
              </Pressable>
            </View>

            <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <MaterialIcons name="search" size={21} color={colors.muted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search this document locally"
                placeholderTextColor={colors.muted}
                returnKeyType="search"
                style={[styles.searchInput, { color: colors.foreground }]}
              />
              {query ? <Pressable onPress={() => setQuery("")} style={({ pressed }) => [styles.clearSearch, pressed && styles.pressed]}><MaterialIcons name="close" size={18} color={colors.muted} /></Pressable> : null}
            </View>

            {activePassage ? (
              <View style={[styles.passageCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.passageMetaRow}>
                  <Text style={[styles.passageMeta, { color: colors.primary }]}>SELECTED · PAGE {activePassage.page}</Text>
                  <Text style={[styles.passageMeta, { color: colors.muted }]}>LOCAL TEXT</Text>
                </View>
                <Text numberOfLines={5} style={[styles.passageText, { color: colors.foreground }]}>{activePassage.text}</Text>
                <Pressable onPress={showVoicePlaceholder} style={({ pressed }) => [styles.voiceButton, { borderColor: colors.primary }, pressed && styles.pressed]}>
                  <MaterialIcons name="record-voice-over" size={20} color={colors.primary} />
                  <Text style={[styles.voiceButtonText, { color: colors.primary }]}>Queue for your custom voice</Text>
                </Pressable>
              </View>
            ) : null}

            <View style={styles.resultsHeading}>
              <Text style={[styles.resultsTitle, { color: colors.foreground }]}>{query ? `Search results (${results.length})` : "Document passages"}</Text>
              <Text style={[styles.resultsHint, { color: colors.muted }]}>{query ? "Tap a result to select it" : "Search by word or phrase"}</Text>
            </View>

            <FlatList
              data={query ? results : document.passages.slice(0, 8).map((passage) => ({ passage, score: 0, excerpt: passage.text, matchedTerms: [] }))}
              keyExtractor={(item) => item.passage.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.resultList}
              renderItem={({ item }) => (
                <Pressable onPress={() => setSelectedPassage(item.passage.id)} style={({ pressed }) => [styles.resultCard, { backgroundColor: colors.surface, borderColor: item.passage.id === selectedPassage ? colors.primary : colors.border }, pressed && styles.pressed]}>
                  <View style={styles.resultTopRow}>
                    <Text style={[styles.resultPage, { color: colors.primary }]}>PAGE {item.passage.page}</Text>
                    {item.passage.id === selectedPassage ? <MaterialIcons name="check-circle" size={18} color={colors.primary} /> : null}
                  </View>
                  <Text numberOfLines={3} style={[styles.resultExcerpt, { color: colors.foreground }]}>{item.excerpt}</Text>
                </Pressable>
              )}
              ListEmptyComponent={<View style={styles.noResults}><MaterialIcons name="find-in-page" size={28} color={colors.muted} /><Text style={[styles.noResultsText, { color: colors.muted }]}>No local passage matches that search.</Text></View>}
            />
          </>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, paddingTop: 16, gap: 14 },
  topbar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brandGroup: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandMark: { width: 40, height: 40, borderRadius: 13, backgroundColor: "rgba(124,108,255,0.15)", alignItems: "center", justifyContent: "center" },
  eyebrow: { fontSize: 10, lineHeight: 13, letterSpacing: 1.4, fontWeight: "800" },
  appName: { fontSize: 23, lineHeight: 28, fontWeight: "800", letterSpacing: -0.5 },
  localPill: { flexDirection: "row", alignItems: "center", gap: 5, borderWidth: 1, borderRadius: 99, paddingHorizontal: 9, paddingVertical: 6 },
  localPillText: { fontSize: 11, fontWeight: "700" },
  statusCard: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderRadius: 15, padding: 12 },
  statusIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statusCopy: { flex: 1, fontSize: 12, lineHeight: 17, fontWeight: "500" },
  emptyCard: { flex: 1, borderWidth: 1, borderRadius: 24, alignItems: "center", justifyContent: "center", padding: 28, gap: 15, marginBottom: 18 },
  emptyIcon: { width: 72, height: 72, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 22, fontWeight: "800", textAlign: "center", letterSpacing: -0.4 },
  emptyCopy: { fontSize: 14, lineHeight: 21, textAlign: "center" },
  primaryButton: { minHeight: 54, alignSelf: "stretch", borderRadius: 17, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, marginTop: 5 },
  primaryButtonText: { fontSize: 16, color: "#FFFFFF", fontWeight: "800" },
  buildNote: { textAlign: "center", fontSize: 11, lineHeight: 16 },
  documentHeader: { flexDirection: "row", gap: 12, alignItems: "center" },
  documentNameWrap: { flex: 1 },
  documentName: { fontSize: 16, fontWeight: "800" },
  documentMeta: { marginTop: 2, fontSize: 12 },
  iconButton: { width: 40, height: 40, borderRadius: 13, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  searchBox: { flexDirection: "row", alignItems: "center", height: 52, borderRadius: 16, borderWidth: 1, paddingHorizontal: 14, gap: 9 },
  searchInput: { flex: 1, height: "100%", fontSize: 15, fontWeight: "500" },
  clearSearch: { padding: 4 },
  passageCard: { borderWidth: 1, borderRadius: 19, padding: 16, gap: 10 },
  passageMetaRow: { flexDirection: "row", justifyContent: "space-between" },
  passageMeta: { fontSize: 10, fontWeight: "800", letterSpacing: 0.9 },
  passageText: { fontSize: 15, lineHeight: 23, fontWeight: "500" },
  voiceButton: { minHeight: 43, alignItems: "center", justifyContent: "center", borderWidth: 1, borderRadius: 13, flexDirection: "row", gap: 7, marginTop: 2 },
  voiceButtonText: { fontSize: 13, fontWeight: "800" },
  resultsHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", paddingTop: 2 },
  resultsTitle: { fontSize: 15, fontWeight: "800" },
  resultsHint: { fontSize: 11 },
  resultList: { paddingBottom: 8, gap: 9 },
  resultCard: { borderWidth: 1, borderRadius: 16, padding: 14, gap: 7 },
  resultTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  resultPage: { fontSize: 10, fontWeight: "800", letterSpacing: 0.8 },
  resultExcerpt: { fontSize: 13, lineHeight: 19, fontWeight: "500" },
  noResults: { alignItems: "center", paddingTop: 32, gap: 8 },
  noResultsText: { fontSize: 13 },
  pressed: { opacity: 0.83, transform: [{ scale: 0.98 }] },
});

import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { STUDY_MATERIAL_MIME_TYPE, encodeStudyMaterial, studyMaterialProblem } from "@/lib/study-materials";
import { trpc } from "@/lib/trpc";

export default function StudyMaterialsScreen() {
  const colors = useColors();
  const router = useRouter();
  const materialsQuery = trpc.studyMaterials.list.useQuery();
  const uploadMutation = trpc.studyMaterials.upload.useMutation({ onSuccess: () => void materialsQuery.refetch() });
  const deleteMutation = trpc.studyMaterials.delete.useMutation({ onSuccess: () => void materialsQuery.refetch() });
  const materials = materialsQuery.data ?? [];

  const chooseMaterial = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: STUDY_MATERIAL_MIME_TYPE, copyToCacheDirectory: true, multiple: false });
      if (result.canceled) return;
      const asset = result.assets[0];
      const problem = studyMaterialProblem(asset);
      if (problem) {
        Alert.alert("Study material not added", problem);
        return;
      }
      const base64Content = await encodeStudyMaterial(asset.uri);
      await uploadMutation.mutateAsync({ title: asset.name.replace(/\.pdf$/i, "") || "Study material", mimeType: STUDY_MATERIAL_MIME_TYPE, base64Content });
    } catch (error) {
      Alert.alert("Material not added", error instanceof Error ? error.message : "Try choosing the PDF again.");
    }
  };

  const removeMaterial = (materialId: number, title: string) => Alert.alert("Remove study material?", `“${title}” will no longer be available as a source reference in Rounds.`, [{ text: "Cancel", style: "cancel" }, { text: "Remove", style: "destructive", onPress: () => void deleteMutation.mutateAsync({ materialId }) }]);

  return (
    <ScreenContainer className="px-5" edges={["top", "left", "right"]}>
      <FlatList
        data={materials}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.content}
        ListHeaderComponent={<View style={styles.header}><Pressable onPress={() => router.back()} accessibilityRole="button"><Text style={[styles.back, { color: colors.primary }]}>‹ Oral Exam</Text></Pressable><Text style={[styles.eyebrow, { color: colors.primary }]}>PRIVATE STUDY MATERIALS</Text><Text style={[styles.title, { color: colors.foreground }]}>Read, search, and ground feedback in your notes.</Text><Text style={[styles.sub, { color: colors.muted }]}>Add a PDF you are allowed to use. Rounds extracts private reading sections for fast topic search, saved passages, and offline cache after first open. It is never shared in Community or used as an official answer source.</Text><View style={[styles.safetyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.safetyTitle, { color: colors.foreground }]}>Use only appropriate study material</Text><Text style={[styles.safetyText, { color: colors.muted }]}>Do not upload patient information, personal records, recalled examination content, or documents you are not permitted to share.</Text></View><Pressable onPress={() => void chooseMaterial()} disabled={uploadMutation.isPending} style={({ pressed }) => [styles.addButton, { backgroundColor: colors.primary }, pressed && styles.pressed, uploadMutation.isPending && styles.disabled]} accessibilityRole="button"><Text style={[styles.addText, { color: colors.background }]}>{uploadMutation.isPending ? "Adding and indexing PDF…" : "Add private PDF"}</Text></Pressable></View>}
        ListEmptyComponent={!materialsQuery.isLoading ? <View style={[styles.empty, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={[styles.emptyTitle, { color: colors.foreground }]}>No study materials yet</Text><Text style={[styles.sub, { color: colors.muted }]}>Add one concise PDF to receive clearly labelled, document-grounded references during an Oral Exam.</Text></View> : null}
        renderItem={({ item }) => <View style={[styles.materialCard, { borderColor: colors.border, backgroundColor: colors.surface }]}><View style={styles.materialHeading}><View style={styles.materialCopy}><Text style={[styles.materialTitle, { color: colors.foreground }]}>{item.title}</Text><Text style={[styles.materialMeta, { color: colors.muted }]}>{Math.max(1, Math.round(item.byteSize / 1024))} KB · Private PDF</Text></View><Pressable onPress={() => removeMaterial(item.id, item.title)} accessibilityRole="button" accessibilityLabel={`Remove ${item.title}`}><Text style={[styles.remove, { color: colors.error }]}>Remove</Text></Pressable></View><Pressable onPress={() => router.push(`/pdf-reader?materialId=${item.id}` as never)} accessibilityRole="button" style={[styles.readButton, { borderColor: colors.primary }]}><Text style={[styles.readText, { color: colors.primary }]}>Read & search PDF</Text></Pressable></View>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 18, paddingBottom: 40, gap: 12 }, header: { gap: 8, marginBottom: 14 }, back: { fontSize: 14, fontWeight: "800", marginBottom: 4 }, eyebrow: { fontSize: 11, letterSpacing: 1.5, fontWeight: "900" }, title: { fontFamily: "Georgia", fontSize: 29, lineHeight: 37, fontWeight: "700" }, sub: { fontSize: 14, lineHeight: 20 }, safetyCard: { borderWidth: 1, borderRadius: 17, padding: 14, gap: 4, marginTop: 5 }, safetyTitle: { fontSize: 14, fontWeight: "900" }, safetyText: { fontSize: 12, lineHeight: 17 }, addButton: { minHeight: 52, borderRadius: 16, alignItems: "center", justifyContent: "center", marginTop: 5 }, addText: { fontSize: 14, fontWeight: "900" }, empty: { borderWidth: 1, borderRadius: 20, padding: 18, gap: 6 }, emptyTitle: { fontSize: 17, fontWeight: "800" }, materialCard: { borderWidth: 1, borderRadius: 18, padding: 15, gap: 12 }, materialHeading: { flexDirection: "row", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }, materialCopy: { flex: 1, gap: 3 }, materialTitle: { fontSize: 16, fontWeight: "800" }, materialMeta: { fontSize: 12 }, remove: { fontSize: 12, fontWeight: "900" }, readButton: { minHeight: 42, borderWidth: 1, borderRadius: 13, alignItems: "center", justifyContent: "center" }, readText: { fontSize: 13, fontWeight: "900" }, pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] }, disabled: { opacity: 0.65 },
});

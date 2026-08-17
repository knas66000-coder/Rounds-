import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { isAcademicProgram, programPackFor } from "@/shared/academic-profile";

export default function AcademicHomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const profileQuery = trpc.academicProfile.get.useQuery();
  const profile = profileQuery.data;
  if (!profile || !isAcademicProgram(profile.program)) return null;
  const pack = programPackFor(profile.program);
  const nursing = pack.id === "nursing";

  return (
    <ScreenContainer className="px-5" edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}><Text style={[styles.eyebrow, { color: colors.primary }]}>{pack.faculty.toUpperCase()}</Text><Text style={[styles.title, { color: colors.foreground }]}>{pack.title} at {profile.institutionName}</Text><Text style={[styles.sub, { color: colors.muted }]}>This is your private Rounds study home. Your selected program determines the pack and learning path you see.</Text></View>
        <View style={[styles.packCard, { borderColor: colors.primary, backgroundColor: colors.surface }]}><Text style={[styles.packLabel, { color: colors.primary }]}>YOUR PROGRAM PACK</Text><Text style={[styles.packTitle, { color: colors.foreground }]}>{pack.packTitle}</Text><Text style={[styles.packText, { color: colors.muted }]}>{pack.description}</Text><Text style={[styles.packStatus, { color: nursing ? colors.success : colors.warning }]}>{nursing ? "INSTALLED AND READY" : "PROGRAM HOME ACTIVE · PACKS ARE COMING"}</Text></View>
        {nursing ? <View style={styles.actions}><Pressable onPress={() => router.replace("/")} style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.primary }, pressed && styles.pressed]} accessibilityRole="button"><Text style={[styles.primaryText, { color: colors.background }]}>Begin Nursing practice</Text></Pressable><View style={styles.secondaryRow}><Pressable onPress={() => router.push("/categories")} style={[styles.secondaryButton, { borderColor: colors.border, backgroundColor: colors.surface }]} accessibilityRole="button"><Text style={[styles.secondaryText, { color: colors.foreground }]}>Choose topic</Text></Pressable><Pressable onPress={() => router.push("/oral-exam")} style={[styles.secondaryButton, { borderColor: colors.border, backgroundColor: colors.surface }]} accessibilityRole="button"><Text style={[styles.secondaryText, { color: colors.foreground }]}>Start Oral Exam</Text></Pressable></View><Pressable onPress={() => router.push("/mock-exam")} accessibilityRole="button"><Text style={[styles.link, { color: colors.primary }]}>Open Nursing mock exam ›</Text></Pressable></View> : <View style={[styles.pendingCard, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={[styles.pendingTitle, { color: colors.foreground }]}>Your program home is ready.</Text><Text style={[styles.pendingText, { color: colors.muted }]}>Rounds will add the downloadable {pack.title} course units here. Until that pack is installed, Nursing clinical questions are intentionally kept separate from your program.</Text></View>}
        <Pressable onPress={() => router.push("/academic-onboarding")} accessibilityRole="button" style={[styles.profileButton, { borderColor: colors.border }]}><Text style={[styles.profileButtonText, { color: colors.foreground }]}>Change university or program</Text></Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 20, paddingBottom: 40, gap: 17 }, header: { gap: 7 }, eyebrow: { fontSize: 11, letterSpacing: 1.6, fontWeight: "900" }, title: { fontFamily: "Georgia", fontSize: 30, lineHeight: 38, fontWeight: "700" }, sub: { fontSize: 14, lineHeight: 21 }, packCard: { borderWidth: 1.5, borderRadius: 23, padding: 19, gap: 7 }, packLabel: { fontSize: 10, letterSpacing: 1.3, fontWeight: "900" }, packTitle: { fontFamily: "Georgia", fontSize: 24, fontWeight: "700" }, packText: { fontSize: 14, lineHeight: 20 }, packStatus: { fontSize: 10, letterSpacing: 1, fontWeight: "900", marginTop: 4 }, actions: { gap: 10 }, primaryButton: { minHeight: 54, borderRadius: 17, alignItems: "center", justifyContent: "center" }, primaryText: { fontSize: 15, fontWeight: "900" }, secondaryRow: { flexDirection: "row", gap: 9 }, secondaryButton: { minHeight: 48, flex: 1, borderWidth: 1, borderRadius: 15, justifyContent: "center", alignItems: "center", paddingHorizontal: 8 }, secondaryText: { fontSize: 13, fontWeight: "900", textAlign: "center" }, link: { textAlign: "center", fontSize: 13, fontWeight: "900", marginTop: 2 }, pendingCard: { borderWidth: 1, borderRadius: 20, padding: 17, gap: 6 }, pendingTitle: { fontSize: 17, fontWeight: "900" }, pendingText: { fontSize: 14, lineHeight: 21 }, profileButton: { minHeight: 48, borderWidth: 1, borderRadius: 15, alignItems: "center", justifyContent: "center" }, profileButtonText: { fontSize: 14, fontWeight: "900" }, pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
});

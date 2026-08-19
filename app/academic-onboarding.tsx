import { useEffect, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { ACADEMIC_PROGRAMS, academicProfileProblem, isUgandaHighSchoolProgram, type AcademicProgramId } from "@/shared/academic-profile";

export default function AcademicOnboardingScreen() {
  const colors = useColors();
  const router = useRouter();
  const profileQuery = trpc.academicProfile.get.useQuery();
  const saveProfile = trpc.academicProfile.save.useMutation();
  const [institutionName, setInstitutionName] = useState("");
  const [program, setProgram] = useState<AcademicProgramId>("nursing");

  useEffect(() => {
    if (!profileQuery.data) return;
    setInstitutionName(profileQuery.data.institutionName);
    setProgram(profileQuery.data.program as AcademicProgramId);
  }, [profileQuery.data]);

  const save = async () => {
    const problem = academicProfileProblem({ institutionName, program });
    if (problem) {
      Alert.alert("Complete your study profile", problem);
      return;
    }
    try {
      await saveProfile.mutateAsync({ institutionName, program });
      await profileQuery.refetch();
      router.replace(isUgandaHighSchoolProgram(program) ? "/high-school-home" : "/academic-home");
    } catch (error) {
      Alert.alert("Profile not saved", error instanceof Error ? error.message : "Please try again when your connection is available.");
    }
  };

  return (
    <ScreenContainer className="px-5" edges={["top", "left", "right"]}>
      <FlatList
        data={ACADEMIC_PROGRAMS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={<View style={styles.header}><Text style={[styles.eyebrow, { color: colors.primary }]}>YOUR ROUNDS STUDY SPACE</Text><Text style={[styles.title, { color: colors.foreground }]}>Set your learning home.</Text><Text style={[styles.sub, { color: colors.muted }]}>Choose your school, university, or college and the subject or program you study. Rounds will open the correct learning pack after this step.</Text><View style={[styles.field, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={[styles.fieldLabel, { color: colors.foreground }]}>School, university, or college</Text><TextInput value={institutionName} onChangeText={setInstitutionName} placeholder="For example, Lakeside Secondary School" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground }]} returnKeyType="done" accessibilityLabel="School, university, or college" /></View><Text style={[styles.selectLabel, { color: colors.primary }]}>CHOOSE YOUR SUBJECT OR PROGRAM</Text><Text style={[styles.selectHelp, { color: colors.muted }]}>Uganda-focused high-school starter packs are available alongside university packs.</Text></View>}
        renderItem={({ item }) => <Pressable onPress={() => setProgram(item.id)} accessibilityRole="radio" accessibilityState={{ selected: program === item.id }} style={({ pressed }) => [styles.programCard, { borderColor: program === item.id ? colors.primary : colors.border, backgroundColor: program === item.id ? colors.surface : colors.background }, pressed && styles.pressed]}><View style={styles.programTop}><View style={styles.programCopy}><Text style={[styles.programTitle, { color: colors.foreground }]}>{item.title}</Text><Text style={[styles.programFaculty, { color: colors.primary }]}>{item.faculty}</Text></View><View style={[styles.choice, { borderColor: program === item.id ? colors.primary : colors.border, backgroundColor: program === item.id ? colors.primary : colors.background }]}>{program === item.id ? <Text style={{ color: colors.background, fontSize: 12, fontWeight: "900" }}>✓</Text> : null}</View></View><Text style={[styles.programDescription, { color: colors.muted }]}>{item.description}</Text>{item.available ? <Text style={[styles.available, { color: colors.success }]}>AVAILABLE NOW · ACTIVE STUDY PACK</Text> : <Text style={[styles.comingSoon, { color: colors.muted }]}>PROGRAM HOME READY · COURSE PACKS FOLLOW</Text>}</Pressable>}
        ListFooterComponent={<View style={styles.footer}><Text style={[styles.privacy, { color: colors.muted }]}>Your school and subject or program stay private to your account. They are not shared in Community.</Text><Pressable onPress={() => void save()} disabled={saveProfile.isPending} style={({ pressed }) => [styles.continueButton, { backgroundColor: colors.primary }, pressed && styles.pressed, saveProfile.isPending && styles.disabled]} accessibilityRole="button"><Text style={[styles.continueText, { color: colors.background }]}>{saveProfile.isPending ? "Saving your study space…" : "Continue to my learning pack"}</Text></Pressable></View>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 20, paddingBottom: 42, gap: 10 }, header: { gap: 9, marginBottom: 5 }, eyebrow: { fontSize: 11, letterSpacing: 1.7, fontWeight: "900" }, title: { fontFamily: "Georgia", fontSize: 31, lineHeight: 39, fontWeight: "700" }, sub: { fontSize: 14, lineHeight: 21 }, field: { borderWidth: 1, borderRadius: 18, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 4, marginTop: 8 }, fieldLabel: { fontSize: 12, fontWeight: "900" }, input: { minHeight: 44, fontSize: 16 }, selectLabel: { fontSize: 11, letterSpacing: 1.4, fontWeight: "900", marginTop: 10 }, selectHelp: { fontSize: 12, lineHeight: 17, marginTop: -4 }, programCard: { borderWidth: 1, borderRadius: 19, padding: 15, gap: 7 }, programTop: { flexDirection: "row", justifyContent: "space-between", gap: 12 }, programCopy: { flex: 1, gap: 2 }, programTitle: { fontSize: 17, fontWeight: "900" }, programFaculty: { fontSize: 11, fontWeight: "800" }, choice: { height: 24, width: 24, borderWidth: 1, borderRadius: 12, alignItems: "center", justifyContent: "center" }, programDescription: { fontSize: 13, lineHeight: 19 }, available: { fontSize: 10, letterSpacing: 1, fontWeight: "900" }, comingSoon: { fontSize: 10, letterSpacing: 0.8, fontWeight: "800" }, footer: { gap: 12, paddingTop: 10 }, privacy: { fontSize: 12, lineHeight: 17, textAlign: "center", paddingHorizontal: 8 }, continueButton: { minHeight: 54, borderRadius: 17, alignItems: "center", justifyContent: "center" }, continueText: { fontSize: 15, fontWeight: "900" }, pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] }, disabled: { opacity: 0.65 },
});

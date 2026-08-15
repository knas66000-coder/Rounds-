import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { categories } from "@/data/questionBank";
import { useColors } from "@/hooks/use-colors";

export default function CategoriesScreen() {
  const colors = useColors();
  const router = useRouter();
  return (
    <ScreenContainer className="px-5" edges={["top", "left", "right"]}>
      <View style={styles.header}><Text style={[styles.eyebrow, { color: colors.primary }]}>QUESTION BANK</Text><Text style={[styles.title, { color: colors.foreground }]}>Choose a domain.</Text><Text style={[styles.sub, { color: colors.muted }]}>Build confidence one clinical area at a time.</Text></View>
      <FlatList data={categories} keyExtractor={(item) => item.name} contentContainerStyle={styles.list} renderItem={({ item, index }) => (
        <Pressable onPress={() => router.replace("/(tabs)")} style={({ pressed }) => [styles.card, { borderColor: colors.border, backgroundColor: colors.surface }, pressed && { opacity: 0.78 }]}>
          <View style={[styles.number, { backgroundColor: colors.background }]}><Text style={{ color: colors.primary, fontWeight: "800" }}>{String(index + 1).padStart(2, "0")}</Text></View>
          <View style={styles.copy}><Text style={[styles.name, { color: colors.foreground }]}>{item.name}</Text><Text style={[styles.topics, { color: colors.muted }]}>{item.topics}</Text></View><Text style={[styles.chevron, { color: colors.primary }]}>›</Text>
        </Pressable>
      )} />
    </ScreenContainer>
  );
}
const styles = StyleSheet.create({ header: { paddingTop: 18, gap: 5 }, eyebrow: { fontSize: 12, letterSpacing: 2.2, fontWeight: "800" }, title: { fontFamily: "Georgia", fontSize: 30, fontWeight: "700", marginTop: 3 }, sub: { fontSize: 14, lineHeight: 20 }, list: { gap: 10, paddingTop: 22, paddingBottom: 30 }, card: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 18, padding: 14, gap: 12 }, number: { width: 40, height: 40, borderRadius: 13, alignItems: "center", justifyContent: "center" }, copy: { flex: 1, gap: 3 }, name: { fontSize: 16, fontWeight: "800" }, topics: { fontSize: 12, lineHeight: 17 }, chevron: { fontSize: 26, fontWeight: "300" } });

import { useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import { haptic } from "@/lib/haptics";
import { useAuthSession } from "@/lib/auth-session";
import { SecureAccessGate } from "@/components/secure-access-gate";
import { hasCommunityProfile } from "@/shared/local-first-access";

type NotificationItem = { id: number; postId: number; type: "reaction" | "reply"; read: boolean; createdAt: Date; title: string; detail: string };

export default function NotificationsScreen() {
  const colors = useColors();
  const { loading, isAuthenticated } = useAuthSession();
  const router = useRouter();
  const communityEnabled = hasCommunityProfile(isAuthenticated);
  const notifications = trpc.notifications.list.useQuery(undefined, { enabled: communityEnabled });
  const unread = trpc.notifications.unreadCount.useQuery(undefined, { enabled: communityEnabled });
  const markRead = trpc.notifications.markRead.useMutation({ onSuccess: () => { void notifications.refetch(); void unread.refetch(); } });
  const markAll = trpc.notifications.markAllRead.useMutation({ onSuccess: () => { void notifications.refetch(); void unread.refetch(); haptic.success(); } });
  if (loading) return <ScreenContainer className="items-center justify-center"><Text>Preparing your study space…</Text></ScreenContainer>;
  if (!communityEnabled) return <SecureAccessGate purpose="community" />;
  const items = (notifications.data ?? []) as NotificationItem[];
  const openNotification = (item: NotificationItem) => {
    if (!item.read) markRead.mutate({ notificationId: item.id });
    haptic.light();
    router.replace("/(tabs)/community");
  };

  return <ScreenContainer className="px-5" edges={["top", "left", "right"]}><FlatList data={items} keyExtractor={(item) => String(item.id)} contentContainerStyle={styles.list} refreshing={notifications.isFetching} onRefresh={() => { void notifications.refetch(); void unread.refetch(); }} ListHeaderComponent={<View style={styles.header}><View style={styles.headerRow}><View><Text style={[styles.eyebrow, { color: colors.primary }]}>PRIVATE ALERTS</Text><Text style={[styles.title, { color: colors.foreground }]}>Notifications</Text></View><Pressable onPress={() => router.back()} accessibilityRole="button"><Text style={[styles.back, { color: colors.primary }]}>Done</Text></Pressable></View><Text style={[styles.sub, { color: colors.muted }]}>Study-update encouragement and replies appear here. Alerts never include the full source content.</Text>{unread.data ? <Pressable onPress={() => markAll.mutate()} disabled={markAll.isPending} accessibilityRole="button" style={[styles.markAll, { borderColor: colors.border }]}><Text style={[styles.markAllText, { color: colors.foreground }]}>{markAll.isPending ? "Updating…" : `Mark ${unread.data} unread as read`}</Text></Pressable> : null}</View>} ListEmptyComponent={<View style={[styles.empty, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={[styles.emptyTitle, { color: colors.foreground }]}>{notifications.isLoading ? "Loading alerts…" : "No alerts yet"}</Text><Text style={[styles.sub, { color: colors.muted }]}>{notifications.isLoading ? "" : "When another learner encourages or replies to your study update, you will see a private alert here."}</Text></View>} renderItem={({ item }) => <Pressable onPress={() => openNotification(item)} accessibilityRole="button" accessibilityLabel={item.title} style={({ pressed }) => [styles.item, { borderColor: item.read ? colors.border : colors.primary, backgroundColor: item.read ? colors.surface : colors.background }, pressed && styles.pressed]}><View style={[styles.dot, { backgroundColor: item.read ? colors.border : colors.primary }]} /><View style={styles.copy}><Text style={[styles.itemTitle, { color: colors.foreground }]}>{item.title}</Text><Text style={[styles.itemDetail, { color: colors.muted }]}>{item.detail}</Text><Text style={[styles.time, { color: colors.muted }]}>{new Date(item.createdAt).toLocaleDateString()}</Text></View></Pressable>} /></ScreenContainer>;
}

const styles = StyleSheet.create({ list: { paddingTop: 18, paddingBottom: 32, gap: 10 }, header: { gap: 9, marginBottom: 6 }, headerRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }, eyebrow: { fontSize: 11, letterSpacing: 1.7, fontWeight: "900" }, title: { fontFamily: "Georgia", fontSize: 31, lineHeight: 39, fontWeight: "700" }, back: { fontSize: 14, fontWeight: "900", paddingTop: 7 }, sub: { fontSize: 14, lineHeight: 20 }, markAll: { borderWidth: 1, borderRadius: 14, minHeight: 42, alignItems: "center", justifyContent: "center", marginTop: 3 }, markAllText: { fontSize: 13, fontWeight: "900" }, item: { borderWidth: 1, borderRadius: 18, padding: 15, flexDirection: "row", gap: 11 }, dot: { width: 9, height: 9, borderRadius: 999, marginTop: 5 }, copy: { flex: 1, gap: 4 }, itemTitle: { fontSize: 15, lineHeight: 21, fontWeight: "900" }, itemDetail: { fontSize: 13, lineHeight: 18 }, time: { fontSize: 11, fontWeight: "700", marginTop: 2 }, empty: { borderWidth: 1, borderRadius: 20, padding: 18, gap: 5, marginTop: 14 }, emptyTitle: { fontSize: 17, fontWeight: "900" }, pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] } });

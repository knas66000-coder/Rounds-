import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Platform } from "react-native";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Reader",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="book.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="ask"
        options={{
          title: "Ask",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="questionmark.circle.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="study"
        options={{
          title: "Study",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="graduationcap.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="studio"
        options={{
          title: "Voice Studio",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="waveform" color={color} />,
        }}
      />
    </Tabs>
  );
}

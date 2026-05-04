import { Tabs } from "expo-router";
import { Home, ScanLine } from "lucide-react-native";
import theme from "@/constants/theme";

export default function AdminTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 3,
          borderTopColor: "#f0f0f0",
          height: 80,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Home
              color={color}
              size={24}
              fill={focused ? color : "transparent"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "Scan",
          tabBarIcon: ({ color, focused }) => (
            <ScanLine color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
    </Tabs>
  );
}

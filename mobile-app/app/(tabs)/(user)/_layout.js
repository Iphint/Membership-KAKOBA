import { Tabs } from "expo-router";
import {
  Home,
  ShoppingBag,
  CreditCard,
  CalendarFold,
  User,
} from "lucide-react-native";
import theme from "../../../constants/theme";

export default function UserTabs() {
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
          tabBarIcon: ({ color }) => <Home color={color} />,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: "Products",
          tabBarIcon: ({ color }) => <ShoppingBag color={color} />,
        }}
      />
      <Tabs.Screen
        name="membership"
        options={{
          title: "Card",
          tabBarIcon: ({ color }) => <CreditCard color={color} />,
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: "Events",
          tabBarIcon: ({ color }) => <CalendarFold color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User color={color} />,
        }}
      />
    </Tabs>
  );
}

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import theme from "@/constants/theme";

export const unstable_settings = {
  initialRouteName: "splash",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerBackTitle: "Back",
          headerStyle: {
            backgroundColor: theme.colors.white,
          },
          headerTintColor: theme.colors.primary,
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      >
        <Stack.Screen name="splash" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="product/[id]" options={{ title: "Product Details" }} />
        <Stack.Screen name="profile/edit" options={{ title: "Edit Profile" }} />
        <Stack.Screen name="profile/settings" options={{ title: "Settings" }} />
        <Stack.Screen name="setting/privacy" options={{ title: "Privacy & Security" }} />
        <Stack.Screen name="setting/help" options={{ title: "Help & Support" }} />
        <Stack.Screen name="transaction/transaction" options={{ title: "Transactions" }} />
        <Stack.Screen name="transaction/[id]" options={{ title: "Transactions Detail" }} />
        <Stack.Screen name="event/[id]" options={{ title: "Events Detail" }} />
      </Stack>
    </>
  );
}
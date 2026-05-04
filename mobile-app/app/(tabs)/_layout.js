/* eslint-disable react-hooks/exhaustive-deps */
// app/_layout.jsx
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator } from "react-native";

export default function RootLayout() {
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();
  const hasNavigated = useRef(false);

  useEffect(() => {
    const loadRole = async () => {
      try {
        const rolesRaw = await AsyncStorage.getItem("roles");
        const roles = rolesRaw ? JSON.parse(rolesRaw) : [];
        const userRole = roles.includes("ADMIN") ? "ADMIN" : "USER";
        setRole(userRole);
      } catch (error) {
        console.error("Error loading role:", error);
        setRole("USER");
      } finally {
        setIsLoading(false);
      }
    };
    loadRole();
  }, []);

  useEffect(() => {
    if (isLoading || !role || hasNavigated.current) return;

    const inAdminGroup = segments[0] === "(admin)";
    const inUserGroup = segments[0] === "(user)";

    if (role === "ADMIN" && !inAdminGroup) {
      hasNavigated.current = true;
      setTimeout(() => router.replace("/(admin)"), 100);
    } else if (role === "USER" && !inUserGroup) {
      hasNavigated.current = true;
      setTimeout(() => router.replace("/(user)"), 100);
    } else {
      hasNavigated.current = true;
    }
  }, [role, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(user)" options={{ headerShown: false }} />
      <Stack.Screen name="(admin)" options={{ headerShown: false }} />
    </Stack>
  );
}
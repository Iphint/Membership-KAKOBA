/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Leaf } from "lucide-react-native";
import theme from "@/constants/theme";
import { useUserStore } from "@/store/userStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SplashScreen() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const isAuthenticated = !!user;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        setTimeout(() => {
          if (token || isAuthenticated) {
            router.replace("/(tabs)");
          } else {
            router.replace("/login");
          }
        }, 2000);
      } catch (error) {
        console.log("Error checking token:", error);
        router.replace("/login");
      }
    };

    checkAuth();
  }, []);
  
  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.primaryDark]}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Leaf color={theme.colors.white} size={60} />
        </View>
        <Text style={styles.title}>Kakoba&apos;s member </Text>
        <Text style={styles.subtitle}>
          Selamat datang di aplikasi My Kakoba
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Tukarkan hadiah menggunakan point anda
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.l,
  },
  title: {
    ...theme.typography.h1,
    fontSize: 36,
    color: theme.colors.white,
    fontWeight: "800",
    marginBottom: theme.spacing.s,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.white,
    opacity: 0.9,
  },
  footer: {
    position: "absolute",
    bottom: 50,
  },
  footerText: {
    ...theme.typography.bodySmall,
    color: theme.colors.white,
    opacity: 0.7,
  },
});

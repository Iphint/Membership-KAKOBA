import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import theme from "@/constants/theme";
import { Settings } from "lucide-react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance, { setAxiosAuthToken } from "../app/utils/axiosInstance";

export default function ProfileHeader({ user }) {
  const router = useRouter();
  const API_URL_IMAGE = process.env.EXPO_PUBLIC_API_URL_IMAGE;
  const [points, setPoint] = useState(null);
  useEffect(() => {
    const getPointsUser = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          router.replace("/login");
          return;
        }
        setAxiosAuthToken(token);
        const res = await axiosInstance.get(`/points/user`);
        const data = res.data.data;

        setPoint(data);
      } catch (error) {
        console.log("Failed to fetch points:", error);
      }
    };

    getPointsUser();
  }, [router]);

  let level = "";

  if (points?.point_balance > 5000) {
    level = "Platinum";
  } else if (points?.point_balance > 2000) {
    level = "Gold";
  } else if (points?.point_balance > 1000) {
    level = "Silver";
  } else {
    level = "Bronze";
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={() => router.push("/profile/edit")}
        >
          <Image
            source={{
              uri: user?.profile_picture
                ? `${API_URL_IMAGE}/${user.profile_picture}`
                : "https://avatar.iran.liara.run/public/25",
            }}
            style={styles.avatar}
          />
          <View style={styles.editBadge}>
            <Text style={styles.editText}>Edit</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.userInfo}>
          <Text style={styles.name}>{user.username}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{level}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push("/profile/settings")}
        >
          <Settings color={theme.colors.text} size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{points?.point_balance ?? 0}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {new Date(user.createdAt).getFullYear()}
          </Text>
          <Text style={styles.statLabel}>Member Since</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.id}</Text>
          <Text style={styles.statLabel}>Member ID</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    paddingTop: theme.spacing.l,
    paddingBottom: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.l,
    marginBottom: theme.spacing.l,
  },
  avatarContainer: {
    position: "relative",
    marginRight: theme.spacing.l,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.round,
    paddingHorizontal: theme.spacing.s,
    paddingVertical: theme.spacing.xs,
  },
  editText: {
    ...theme.typography.caption,
    color: theme.colors.white,
    fontWeight: "600",
  },
  userInfo: {
    flex: 1,
  },
  name: {
    ...theme.typography.h2,
    marginBottom: theme.spacing.xs,
  },
  levelBadge: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.round,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.xs,
    alignSelf: "flex-start",
  },
  levelText: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  settingsButton: {
    padding: theme.spacing.s,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: theme.spacing.l,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    ...theme.typography.h2,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    ...theme.typography.caption,
  },
  divider: {
    width: 1,
    height: "80%",
    backgroundColor: theme.colors.border,
  },
});

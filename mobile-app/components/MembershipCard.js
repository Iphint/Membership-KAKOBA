import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image, ImageBackground } from "react-native";
import theme from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUserStore } from "@/store/userStore";
import axiosInstance, { setAxiosAuthToken } from "../app/utils/axiosInstance";

export default function MembershipCard() {
  const user = useUserStore((state) => state.user);
  const [dataUser, setDataUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          console.warn("No token found");
          return;
        }
        setAxiosAuthToken(token);
        const res = await axiosInstance.get(`/user/${user.id}`);
        setDataUser(res.data.data);
      } catch (error) {
        console.log(
          "Error fetching user data:",
          error.response?.data || error.message
        );
      }
    };

    fetchUserData();
  }, [user.id]);

  if (!dataUser) {
    return (
      <View style={styles.card}>
        <Text style={{ color: "white", textAlign: "center" }}>Loading...</Text>
      </View>
    );
  }

  const pointBalance = dataUser?.Point?.[0]?.point_balance ?? 0;

  return (
    <ImageBackground
      source={require("@/assets/images/member_card.png")}
      resizeMode="cover"
      style={styles.card}
      imageStyle={styles.imageRadius}
    >
      <View style={styles.overlay} />
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.level}>{user.membershipLevel}</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.userInfo}>
            <Text style={styles.name}>{dataUser.username}</Text>
            <Text style={styles.memberId}>ID: {dataUser.id}</Text>
            <Text style={styles.memberSince}>
              Member since {new Date(dataUser.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.points}>{pointBalance} points</Text>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 220,
    borderRadius: theme.radius.l,
    overflow: "hidden",
    marginVertical: theme.spacing.m,
  },
  imageRadius: {
    borderRadius: theme.radius.l,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  inner: {
    flex: 1,
    padding: theme.spacing.l,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  logo: {
    ...theme.typography.h3,
    color: "#fff",
    fontWeight: "800",
  },
  level: {
    ...theme.typography.h3,
    color: "#FFD700",
    fontWeight: "700",
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfo: {
    flex: 1,
  },
  name: {
    ...theme.typography.h2,
    color: "#fff",
  },
  memberId: {
    ...theme.typography.body,
    color: "#fff",
  },
  memberSince: {
    ...theme.typography.bodySmall,
    color: "#eee",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#fff",
  },
  footer: {
    alignItems: "flex-end",
  },
  points: {
    ...theme.typography.h3,
    color: "#FFD700",
    fontWeight: "800",
  },
});


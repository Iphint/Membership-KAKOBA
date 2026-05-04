import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  User,
  Mail,
  Shield,
  LogOut,
  Calendar,
  Clock,
} from "lucide-react-native";
import theme from "@/constants/theme";

const HomeScreen = () => {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      // Load user data from AsyncStorage
      const userData = await AsyncStorage.getItem("user");
      const rolesData = await AsyncStorage.getItem("roles");
      const tokenData = await AsyncStorage.getItem("token");

      if (userData) {
        const user = JSON.parse(userData);
        const roles = rolesData ? JSON.parse(rolesData) : [];

        setUserInfo({
          name: user.name || "User",
          email: user.email || "user@example.com",
          roles: roles,
          loginTime: new Date().toLocaleString("id-ID"),
          hasToken: !!tokenData,
        });
      }
    } catch (error) {
      console.error("Error loading user info:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Konfirmasi Logout", "Apakah Anda yakin ingin keluar?", [
      {
        text: "Batal",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            // Clear all user data
            await AsyncStorage.multiRemove(["user", "roles", "token"]);

            // Navigate to login screen
            router.replace("/login");
          } catch (error) {
            console.error("Error logging out:", error);
            Alert.alert("Error", "Gagal logout. Silakan coba lagi.");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Selamat Datang! 👋</Text>
        <Text style={styles.subGreeting}>Senang melihat Anda kembali</Text>
      </View>

      {/* User Info Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatarContainer}>
            <User size={32} color="white" />
          </View>
          <View style={styles.userBasicInfo}>
            <Text style={styles.userName}>{userInfo?.name}</Text>
            <View style={styles.roleContainer}>
              {userInfo?.roles.map((role, index) => (
                <View key={index} style={styles.roleBadge}>
                  <Text style={styles.roleText}>{role}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* User Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Mail size={18} color={theme.colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Email</Text>
              <Text style={styles.detailValue}>{userInfo?.email}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Shield size={18} color={theme.colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Role</Text>
              <Text style={styles.detailValue}>
                {userInfo?.roles.join(", ")}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Clock size={18} color={theme.colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Waktu Login</Text>
              <Text style={styles.detailValue}>{userInfo?.loginTime}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Calendar size={18} color={theme.colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Status</Text>
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Aktif</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LogOut size={20} color="white" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpace} />
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },

  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: "white",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

  greeting: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 6,
  },

  subGreeting: {
    fontSize: 15,
    color: "#666",
  },

  card: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  userBasicInfo: {
    flex: 1,
  },

  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
  },

  roleContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },

  roleBadge: {
    backgroundColor: `${theme.colors.primary}15`,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },

  roleText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "600",
  },

  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginBottom: 20,
  },

  detailsContainer: {
    gap: 16,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${theme.colors.primary}10`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  detailContent: {
    flex: 1,
  },

  detailLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
    fontWeight: "500",
  },

  detailValue: {
    fontSize: 15,
    color: "#333",
    fontWeight: "600",
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4CAF50",
    marginRight: 6,
  },

  statusText: {
    color: "#4CAF50",
    fontSize: 13,
    fontWeight: "600",
  },

  statsContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 16,
    gap: 12,
  },

  statCard: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },

  statNumber: {
    fontSize: 32,
    fontWeight: "700",
    color: theme.colors.primary,
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
  },

  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EF4444",
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  logoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  bottomSpace: {
    height: 40,
  },
});

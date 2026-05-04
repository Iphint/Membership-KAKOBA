import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import theme from "@/constants/theme";
import { useUserStore } from "@/store/userStore";
import ProfileHeader from "@/components/ProfileHeader";
import Card from "@/components/Card";
import {
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  Clock,
  ShieldCheck,
  MessageSquare,
  CircleUser,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance, { setAxiosAuthToken } from "../../utils/axiosInstance";
import TransactionItem from "../../../components/TransactionItem";


export default function ProfileScreen() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);
  const [transactions, setTransactions] = useState(null);

  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  useEffect(() => {
    if (!user) return;
    const getTransactions = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          console.warn("No token found");
          return;
        }

        if (!user?.id) {
          console.warn("User ID is undefined");
          return;
        }

        setAxiosAuthToken(token);
        const res = await axiosInstance.get(`/transactions/user/${user.id}`);
        const data = res.data.data;

        const sortedData = [...data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setTransactions(sortedData);
      } catch (error) {
        console.warn("Failed to fetch transactions:", error);
      }
    };

    getTransactions();
  }, [API_URL, user]);

  const recentTransactions = transactions?.slice(0, 5) ?? [];

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ProfileHeader user={user} />
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <CircleUser />
          <Text style={styles.sectionTitle}>Account</Text>
        </View>

        <Card style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/profile/settings")}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: "#E3F2FD" }]}>
                <Bell size={20} color="#2196F3" />
              </View>
              <Text style={styles.menuText}>Notifications</Text>
            </View>
            <ChevronRight size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/profile/privacy")}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: "#E8F5E9" }]}>
                <ShieldCheck size={20} color="#4CAF50" />
              </View>
              <Text style={styles.menuText}>Privacy & Security</Text>
            </View>
            <ChevronRight size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/profile/help")}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: "#FFF8E1" }]}>
                <HelpCircle size={20} color="#FFC107" />
              </View>
              <Text style={styles.menuText}>Help & Support</Text>
            </View>
            <ChevronRight size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </Card>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Clock size={20} color={theme.colors.text} />
          <Text style={styles.sectionTitle}>Recent Activity</Text>
        </View>

        <Card style={styles.transactionsCard}>
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))
          ) : (
            <Text style={styles.noTransactionText}>
              No transactions found for this user.
            </Text>
          )}

          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => router.push("/transaction/transaction")}
          >
            <Text style={styles.viewAllText}>View All Transactions</Text>
          </TouchableOpacity>
        </Card>
      </View>

      <View style={styles.section}>
        <Card style={styles.supportCard}>
          <View style={styles.supportContent}>
            <View style={styles.supportIconContainer}>
              <MessageSquare size={24} color={theme.colors.white} />
            </View>
            <View style={styles.supportTextContainer}>
              <Text style={styles.supportTitle}>Need Help?</Text>
              <Text style={styles.supportDescription}>
                Our support team is ready to assist you with any questions.
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.supportButton} onPress={() => {}}>
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </Card>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LogOut size={20} color={theme.colors.error} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: 70,
  },
  section: {
    paddingHorizontal: theme.spacing.l,
  },
  sectionHeader: {
    flexDirection: "row",
    marginBottom: theme.spacing.s,
    alignItems: "center",
  },
  sectionTitle: {
    ...theme.typography.h3,
    marginLeft: theme.spacing.s,
    marginBottom: theme.spacing.m,
    paddingTop: theme.spacing.m,
  },
  menuCard: {
    padding: 0,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing.m,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.m,
  },
  menuText: {
    ...theme.typography.body,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
  transactionsCard: {
    padding: theme.spacing.m,
  },
  viewAllButton: {
    alignItems: "center",
    paddingVertical: theme.spacing.m,
    marginTop: theme.spacing.s,
  },
  viewAllText: {
    ...theme.typography.body,
    color: theme.colors.primary,
  },
  supportCard: {
    backgroundColor: theme.colors.primary,
  },
  supportContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.m,
  },
  supportIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.m,
  },
  supportTextContainer: {
    flex: 1,
  },
  supportTitle: {
    ...theme.typography.h3,
    color: theme.colors.white,
    marginBottom: theme.spacing.xs,
  },
  supportDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.white,
    opacity: 0.9,
  },
  supportButton: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.m,
    paddingVertical: theme.spacing.s,
    alignItems: "center",
  },
  supportButtonText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.l,
    marginBottom: theme.spacing.xl,
  },
  logoutText: {
    ...theme.typography.body,
    color: theme.colors.error,
    marginLeft: theme.spacing.s,
  },
  noTransactionText: {
    ...theme.typography.bodySmall,
    textAlign: "center",
    color: theme.colors.error,
  },
});

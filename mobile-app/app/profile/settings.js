import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Switch,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import theme from "@/constants/theme";
import {
  Bell,
  Globe,
  Shield,
  Smartphone,
  HelpCircle,
} from "lucide-react-native";
import axiosInstance from "../utils/axiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerForPushNotificationsAsync } from "../../services/NotificationService";

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [locationServices, setLocationServices] = useState(false);

  useEffect(() => {
    (async () => {
      const savedNotif = await AsyncStorage.getItem("notifications");
      if (savedNotif !== null) setNotifications(savedNotif === "true");
    })();
  }, []);

  const handleNotificationToggle = async (value) => {
    setNotifications(value);
    await AsyncStorage.setItem("notifications", value.toString());
    try {
      if (value) {
        const token = await registerForPushNotificationsAsync();
        if (!token) {
          console.warn("Failed to get push token");
          return;
        }
        const res = await axiosInstance.post(`/push-token`, {
          expoPushToken: token,
        });
        console.log("Push token saved:", res.data);
        setNotifications(true);
      } else {
        await axiosInstance.post(`/push-token`, {
          expoPushToken: null,
        });
        console.log("Push token deleted");
        setNotifications(false);
      }
    } catch (error) {
      console.error(
        "Error updating push token:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Bell size={20} color={theme.colors.text} />
          <Text style={styles.sectionTitle}>Notifications</Text>
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Push Notifications</Text>
          <Switch
            value={notifications}
            onValueChange={handleNotificationToggle}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.primaryLight,
            }}
            thumbColor={
              notifications ? theme.colors.primary : theme.colors.white
            }
          />
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Globe size={20} color={theme.colors.text} />
          <Text style={styles.sectionTitle}>Appearance</Text>
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.primaryLight,
            }}
            thumbColor={darkMode ? theme.colors.primary : theme.colors.white}
          />
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Shield size={20} color={theme.colors.text} />
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Location Services</Text>
          <Switch
            value={locationServices}
            onValueChange={setLocationServices}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.primaryLight,
            }}
            thumbColor={
              locationServices ? theme.colors.primary : theme.colors.white
            }
          />
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Smartphone size={20} color={theme.colors.text} />
          <Text style={styles.sectionTitle}>App Information</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Version</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <HelpCircle size={20} color={theme.colors.text} />
          <Text style={styles.sectionTitle}>Support</Text>
        </View>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Contact Support</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Report a Bug</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>FAQ</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  section: {
    padding: theme.spacing.l,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.m,
  },
  sectionTitle: {
    ...theme.typography.h3,
    marginLeft: theme.spacing.s,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.m,
  },
  settingLabel: {
    ...theme.typography.body,
  },
  divider: {
    height: 8,
    backgroundColor: theme.colors.card,
  },
  button: {
    paddingVertical: theme.spacing.m,
  },
  buttonText: {
    ...theme.typography.body,
    color: theme.colors.primary,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.m,
  },
  infoLabel: {
    ...theme.typography.body,
  },
  infoValue: {
    ...theme.typography.bodySmall,
  },
});

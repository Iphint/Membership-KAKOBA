/* eslint-disable react/no-unescaped-entities */
import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import theme from "@/constants/theme";
import {
  HelpCircle,
  Mail,
  Smartphone,
  FileText,
  Shield,
  Clock,
} from "lucide-react-native";
import { Stack } from "expo-router";

const SUPPORT_EMAIL = "kampoengkopibanaran@gmail.com";
const SUPPORT_PHONE = "+62 811-2721-770";
const PRIVACY_URL = "https://kakoba.id/privacy";
const TERMS_URL = "https://kakoba.id/terms";

export default function HelpScreen() {
  const openEmail = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Help%20Request`);
  };

  const openPhone = () => {
    Linking.openURL(`tel:${SUPPORT_PHONE}`);
  };

  const openLink = (url) => {
    Linking.openURL(url);
  };

  return (
    <>
      <Stack.Screen options={{ title: "Help & Support" }} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <HelpCircle size={32} color={theme.colors.primary} />
          <Text style={styles.title}>Help & Support</Text>
          <Text style={styles.subtitle}>
            Kami siap membantu kamu kapan saja
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Butuh Bantuan?</Text>
          <Text style={styles.sectionDescription}>
            Pilih opsi di bawah untuk menghubungi tim support kami
          </Text>

          <TouchableOpacity style={styles.card} onPress={openEmail}>
            <View style={styles.cardIcon}>
              <Mail size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Email Kami</Text>
              <Text style={styles.cardSubtitle}>{SUPPORT_EMAIL}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={openPhone}>
            <View style={styles.cardIcon}>
              <Smartphone size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Telepon Langsung</Text>
              <Text style={styles.cardSubtitle}>{SUPPORT_PHONE}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informasi Penting</Text>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => openLink(PRIVACY_URL)}
          >
            <FileText size={18} color={theme.colors.text} />
            <Text style={styles.actionText}>Kebijakan Privasi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => openLink(TERMS_URL)}
          >
            <Shield size={18} color={theme.colors.text} />
            <Text style={styles.actionText}>Syarat & Ketentuan</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <Clock size={18} color={theme.colors.text} />
            <Text style={styles.actionText}>Jam Operasional Support</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Pertanyaan Umum</Text>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>
              Bagaimana cara mendaftar event?
            </Text>
            <Text style={styles.faqAnswer}>
              Buka halaman "Info Event", pilih event yang kamu minati, lalu
              tekan tombol "Daftar Sekarang".
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Apa itu poin KAKOBA?</Text>
            <Text style={styles.faqAnswer}>
              Poin KAKOBA adalah reward yang kamu dapatkan dari partisipasi
              kegiatan. Poin ini bisa ditukar dengan hadiah menarik!
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Notifikasi tidak muncul?</Text>
            <Text style={styles.faqAnswer}>
              Pastikan izin notifikasi diaktifkan di Pengaturan {">"}{" "}
              Notifikasi, dan kamu telah mengaktifkan "Push Notifications" di
              pengaturan aplikasi.
            </Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.l,
  },
  header: {
    alignItems: "center",
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.xl,
  },
  title: {
    ...theme.typography.h1,
    marginTop: theme.spacing.m,
    textAlign: "center",
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: theme.spacing.s,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.s,
  },
  sectionDescription: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.m,
  },
  card: {
    flexDirection: "row",
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    alignItems: "center",
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.m,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    ...theme.typography.body,
    fontWeight: "600",
    marginBottom: theme.spacing.xs,
  },
  cardSubtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.s,
  },
  actionText: {
    ...theme.typography.body,
    marginLeft: theme.spacing.m,
    color: theme.colors.text,
  },
  faqSection: {
    marginBottom: theme.spacing.xl,
  },
  faqItem: {
    marginBottom: theme.spacing.l,
  },
  faqQuestion: {
    ...theme.typography.body,
    fontWeight: "600",
    marginBottom: theme.spacing.xs,
  },
  faqAnswer: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
});

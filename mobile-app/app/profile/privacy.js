import React from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import theme from "@/constants/theme";
import { Shield, Lock, User, EyeOff, Database } from "lucide-react-native";
import { Stack } from "expo-router";

export default function PrivacyScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Privacy & Security" }} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Shield size={32} color={theme.colors.primary} />
          <Text style={styles.title}>Privacy & Security</Text>
          <Text style={styles.subtitle}>
            Kami menjaga data dan privasi kamu dengan serius
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Lock size={20} color={theme.colors.text} />
            <Text style={styles.sectionTitle}>Keamanan Data</Text>
          </View>
          <Text style={styles.paragraph}>
            Semua data pribadi kamu dienkripsi dan disimpan dengan aman sesuai
            standar keamanan internasional. Kami tidak pernah membagikan data
            pribadimu kepada pihak ketiga tanpa persetujuanmu.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <User size={20} color={theme.colors.text} />
            <Text style={styles.sectionTitle}>
              Informasi yang Kami Kumpulkan
            </Text>
          </View>
          <Text style={styles.paragraph}>
            • Nama lengkap dan nomor telepon{"\n"}• Email dan foto profil{"\n"}•
            Riwayat partisipasi event{"\n"}• Poin reward dan transaksi{"\n"}•
            Lokasi (hanya saat digunakan untuk event)
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <EyeOff size={20} color={theme.colors.text} />
            <Text style={styles.sectionTitle}>Privasi Lokasi</Text>
          </View>
          <Text style={styles.paragraph}>
            Kami hanya mengakses lokasimu saat kamu mengaktifkan fitur lokasi
            untuk mencari event terdekat. Lokasi tidak disimpan secara permanen
            dan tidak dibagikan ke pihak lain.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Database size={20} color={theme.colors.text} />
            <Text style={styles.sectionTitle}>Hak Kamu</Text>
          </View>
          <Text style={styles.paragraph}>
            Kamu berhak untuk:{"\n"}• Mengakses dan mengunduh data pribadimu
            {"\n"}• Memperbarui atau menghapus akun kapan saja{"\n"}• Menarik
            persetujuan penggunaan data{"\n"}• Menghubungi kami untuk pertanyaan
            privasi
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kontak Privasi</Text>
          <Text style={styles.paragraph}>
            Jika kamu memiliki pertanyaan atau permintaan terkait privasi, kamu
            bisa menghubungi kami melalui:{"\n\n"}
            📧 Email: kampoengkopibanaran@gmail.com{"\n"}
            📞 Telepon: +62 811-2721-770
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Terakhir diperbarui: 1 November 2025
          </Text>
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
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.m,
  },
  sectionTitle: {
    ...theme.typography.h3,
    marginLeft: theme.spacing.s,
  },
  paragraph: {
    ...theme.typography.body,
    lineHeight: 24,
    color: theme.colors.text,
  },
  footer: {
    alignItems: "center",
    paddingBottom: theme.spacing.xl,
  },
  footerText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
});

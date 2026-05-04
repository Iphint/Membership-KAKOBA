/* eslint-disable react-hooks/exhaustive-deps */
import { StyleSheet, Text, View, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance, { setAxiosAuthToken } from "../../utils/axiosInstance";
import QRCode from "react-native-qrcode-svg";
import theme from "../../../constants/theme";
import { RotateCcw, AlertCircle, CheckCircle } from "lucide-react-native";
import Button from "@/components/Button";

export default function QrCodeScreen() {
  const { id } = useLocalSearchParams();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchTransaction = async (showAlert = false) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }
      setAxiosAuthToken(token);
      const res = await axiosInstance.get(`/transaction/${id}`);
      const data = res.data.data;
      setTransaction(data);
      if (showAlert && data.qr_code_token) {
        Alert.alert("Refreshed", "QR code updated successfully!");
      }
    } catch (error) {
      console.error("Error fetching transaction:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to load transaction"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransaction();
    const interval = setInterval(() => {
      fetchTransactionSilent();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const fetchTransactionSilent = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      setAxiosAuthToken(token);
      const res = await axiosInstance.get(`/transaction/${id}`);
      const data = res.data.data;

      if (data.qr_code_used === true && transaction?.qr_code_used === false) {
        Alert.alert("Success! ✅", "QR Code has been scanned and redeemed", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      }

      setTransaction(data);
    } catch (error) {
      console.error("Polling error:", error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransaction(true);
  };

  const handleBack = () => {
    router.back();
  };

  const hasQrCode = transaction?.qr_code_token;
  const isUsed = transaction?.qr_code_used === true;

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Loading QR..." }} />
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Preparing your QR code...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Transaction QR Code" }} />
      <View style={styles.header}>
        <Text style={styles.title}>Show this QR to staff</Text>
        <Text style={styles.subtitle}>Transaction ID: #{id}</Text>
      </View>
      <View style={styles.qrCard}>
        {hasQrCode ? (
          <>
            <View style={styles.qrContainer}>
              <QRCode
                value={JSON.stringify({
                  id: transaction.id,
                  qr_code_token: transaction.qr_code_token,
                })}
                size={220}
                color={theme.colors.primary}
                backgroundColor="#fff"
                logo={require("@/assets/images/cup.png")}
                logoSize={40}
                logoBackgroundColor="transparent"
              />
            </View>
            {isUsed ? (
              <View style={styles.statusBadge}>
                <AlertCircle size={16} color={theme.colors.error} />
                <Text style={styles.statusText}>Already Used Claimed</Text>
              </View>
            ) : (
              <View style={styles.statusBadgeSuccess}>
                <CheckCircle size={16} color={theme.colors.success} />
                <Text style={styles.statusTextSuccess}>Ready to Scan</Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.noQrContainer}>
            <View style={styles.warningIcon}>
              <AlertCircle size={48} color={theme.colors.warning} />
            </View>
            <Text style={styles.noQrTitle}>No QR Code Available</Text>
            <Text style={styles.noQrMessage}>
              QR code has not been generated for this transaction yet, or the
              service is unavailable.
            </Text>
            <Text style={styles.noQrHint}>
              Please contact support or try again later.
            </Text>
          </View>
        )}
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>How to use</Text>
        <Text style={styles.infoText}>
          • Present this QR code to staff for verification{"\n"}• Make sure
          screen brightness is sufficient{"\n"}• QR code is valid for one-time
          use only
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Refresh QR"
          onPress={onRefresh}
          icon={<RotateCcw size={16} />}
          disabled={refreshing}
          style={styles.refreshButton}
        />
        <Button
          title="Back to Transactions"
          onPress={handleBack}
          type="outline"
        />
      </View>
    </View>
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
  },
  title: {
    ...theme.typography.h2,
    fontWeight: "700",
    color: theme.colors.text,
    textAlign: "center",
  },
  subtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  qrCard: {
    backgroundColor: "#fff",
    borderRadius: theme.radius.l,
    padding: theme.spacing.l,
    marginBottom: theme.spacing.l,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  qrContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: theme.spacing.m,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.errorLight,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.radius.m,
  },
  statusBadgeSuccess: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.successLight,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.radius.m,
  },
  statusText: {
    ...theme.typography.bodySmall,
    color: theme.colors.error,
    fontWeight: "600",
    marginLeft: theme.spacing.s,
  },
  statusTextSuccess: {
    ...theme.typography.bodySmall,
    color: theme.colors.success,
    fontWeight: "600",
    marginLeft: theme.spacing.s,
  },
  noQrContainer: {
    alignItems: "center",
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.l,
  },
  warningIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.warningLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.m,
  },
  noQrTitle: {
    ...theme.typography.h3,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
    textAlign: "center",
  },
  noQrMessage: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: theme.spacing.s,
    lineHeight: 22,
  },
  noQrHint: {
    ...theme.typography.bodySmall,
    color: theme.colors.textTertiary,
    textAlign: "center",
    fontStyle: "italic",
  },
  infoBox: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.l,
  },
  infoTitle: {
    ...theme.typography.h3,
    fontWeight: "600",
    marginBottom: theme.spacing.s,
  },
  infoText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  buttonContainer: {
    gap: theme.spacing.m,
  },
  refreshButton: {
    backgroundColor: theme.colors.primaryLight,
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
});

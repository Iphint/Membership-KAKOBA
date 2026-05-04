/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Animated,
  StatusBar,
  Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import {
  RefreshCcw,
  Zap,
  CheckCircle2,
  AlertCircle,
  Camera,
} from "lucide-react-native";
import theme from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance, { setAxiosAuthToken } from "../../utils/axiosInstance";

const { width } = Dimensions.get("window");
const SCAN_BOX_SIZE = width * 0.7;

export default function Scan() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [barcode, setBarcode] = useState(null);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  // Animations
  const scanLineAnim = useState(new Animated.Value(0))[0];
  const pulseAnim = useState(new Animated.Value(1))[0];
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideUpAnim = useState(new Animated.Value(100))[0];

  // Scanning line animation
  useEffect(() => {
    if (!scanned) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [scanned]);

  // Pulse animation for scan box corners
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Result animation
  useEffect(() => {
    if (barcode) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideUpAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideUpAnim.setValue(100);
    }
  }, [barcode]);

  const handleBarcodeScanned = async ({ data }) => {
    if (isProcessing) return;

    setScanned(true);
    setBarcode(data);
    setIsProcessing(true);

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error ⚠️", "Token tidak ditemukan, silakan login ulang", [
          { text: "OK", onPress: () => handleScanAgain() },
        ]);
        return;
      }
      let qrData;
      try {
        qrData = JSON.parse(data);
      } catch (parseError) {
        console.error("❌ JSON Parse Error:", parseError);
      }

      const { id, qr_code_token } = qrData;

      if (!id || !qr_code_token) {
        throw new Error("Invalid QR Code format");
      }
      setAxiosAuthToken(token);
      const response = await axiosInstance.put(
        `${API_URL}/transaction/redeem/${id}`,
        {
          qr_code_token: qr_code_token,
        }
      );
      Alert.alert(
        "Berhasil! ✅",
        response.data?.message || "QR Code berhasil di-redeem",
        [
          {
            text: "OK",
            onPress: () => {
              setTimeout(() => handleScanAgain(), 500);
            },
          },
        ]
      );
    } catch (error) {
      let errorMessage = "Terjadi kesalahan saat memproses QR Code";
      if (error.message === "Invalid QR Code format") {
        errorMessage = "Format QR Code tidak valid";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Silakan coba lagi.";
      } else if (error.response?.status === 401) {
        errorMessage = "Token tidak valid. Silakan login ulang.";
      } else if (error.response?.status === 404) {
        errorMessage = "Transaksi tidak ditemukan.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      Alert.alert("Gagal ❌", errorMessage, [
        {
          text: "Coba Lagi",
          onPress: () => handleScanAgain(),
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleScanAgain = () => {
    setScanned(false);
    setBarcode(null);
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionCard}>
          <Camera size={64} color={theme.colors.primary} />
          <Text style={styles.permissionTitle}>Akses Kamera Diperlukan</Text>
          <Text style={styles.permissionText}>
            Aplikasi membutuhkan akses kamera untuk memindai QR code dan barcode
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Izinkan Kamera</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCAN_BOX_SIZE - 4],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <CameraView
        style={styles.camera}
        enableTorch={flashEnabled}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "ean13", "ean8", "code128", "code39", "upc_a"],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      {/* Dark Overlay */}
      <View style={styles.overlay}>
        {/* Top Dark Area */}
        <View style={styles.darkArea} />

        {/* Middle Row with Scan Box */}
        <View style={styles.middleRow}>
          <View style={styles.darkArea} />

          {/* Scan Box Container */}
          <View style={styles.scanBoxContainer}>
            {/* Animated Corners */}
            <Animated.View
              style={[
                styles.corner,
                styles.topLeft,
                { transform: [{ scale: pulseAnim }] },
              ]}
            />
            <Animated.View
              style={[
                styles.corner,
                styles.topRight,
                { transform: [{ scale: pulseAnim }] },
              ]}
            />
            <Animated.View
              style={[
                styles.corner,
                styles.bottomLeft,
                { transform: [{ scale: pulseAnim }] },
              ]}
            />
            <Animated.View
              style={[
                styles.corner,
                styles.bottomRight,
                { transform: [{ scale: pulseAnim }] },
              ]}
            />

            {/* Scanning Line */}
            {!scanned && (
              <Animated.View
                style={[
                  styles.scanLine,
                  { transform: [{ translateY: scanLineTranslateY }] },
                ]}
              />
            )}

            {/* Success Overlay */}
            {scanned && (
              <View style={styles.successOverlay}>
                <CheckCircle2 size={48} color="#4CAF50" />
              </View>
            )}
          </View>

          <View style={styles.darkArea} />
        </View>

        {/* Bottom Dark Area */}
        <View style={styles.darkArea} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scan QR / Barcode</Text>
        <Text style={styles.headerSubtitle}>
          Arahkan kamera ke kode yang ingin dipindai
        </Text>
      </View>

      {/* Flash Toggle */}
      <TouchableOpacity
        style={styles.flashButton}
        onPress={() => setFlashEnabled(!flashEnabled)}
      >
        <Zap
          size={24}
          color={flashEnabled ? "#FFC107" : "white"}
          fill={flashEnabled ? "#FFC107" : "transparent"}
        />
      </TouchableOpacity>

      {/* Result Card */}
      {barcode && (
        <Animated.View
          style={[
            styles.resultCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            },
          ]}
        >
          <View style={styles.resultHeader}>
            <CheckCircle2 size={24} color="#4CAF50" />
            <Text style={styles.resultTitle}>Berhasil Dipindai!</Text>
          </View>

          <View style={styles.resultContent}>
            <Text style={styles.resultLabel}>Data:</Text>
            <Text style={styles.resultText} numberOfLines={3}>
              {barcode}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.scanAgainButton}
            onPress={handleScanAgain}
          >
            <RefreshCcw size={20} color="white" />
            <Text style={styles.scanAgainText}>Scan Lagi</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Helper Text */}
      {!scanned && (
        <View style={styles.helperContainer}>
          <AlertCircle size={16} color="rgba(255,255,255,0.7)" />
          <Text style={styles.helperText}>
            Pastikan kode berada dalam kotak
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  camera: {
    flex: 1,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },

  // Permission Styles
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },

  permissionCard: {
    backgroundColor: "white",
    padding: 32,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    maxWidth: 340,
  },

  permissionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a1a",
    marginTop: 20,
    marginBottom: 12,
    textAlign: "center",
  },

  permissionText: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },

  permissionButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
  },

  permissionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },

  // Overlay Styles
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  darkArea: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
  },

  middleRow: {
    flexDirection: "row",
    height: SCAN_BOX_SIZE,
  },

  scanBoxContainer: {
    width: SCAN_BOX_SIZE,
    height: SCAN_BOX_SIZE,
    position: "relative",
  },

  // Corner Styles
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: theme.colors.primary,
  },

  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },

  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },

  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },

  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },

  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },

  successOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },

  // Header Styles
  header: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 20,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  // Flash Button
  flashButton: {
    position: "absolute",
    top: 60,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },

  // Result Card
  resultCard: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },

  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },

  resultTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginLeft: 12,
  },

  resultContent: {
    marginBottom: 16,
  },

  resultLabel: {
    fontSize: 12,
    color: "#999",
    fontWeight: "600",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  resultText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
    lineHeight: 22,
  },

  scanAgainButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },

  scanAgainText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  helperContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  helperText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});

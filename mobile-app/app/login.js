/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  ImageBackground,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Mail, Lock, Eye, EyeOff } from "lucide-react-native";
import Button from "@/components/Button";
import { useUserStore } from "@/store/userStore";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";

export default function LoginScreen() {
  const router = useRouter();
  const login = useUserStore((state) => state.login);
  const [images, setImages] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [currentIndex, setCurrentIndex] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;

  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const API_URL_IMAGE = process.env.EXPO_PUBLIC_API_URL_IMAGE;

  const getDataImages = async () => {
    try {
      const response = await axios.get(`${API_URL}/images-view`);
      setImages(response.data.data);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  useEffect(() => {
    getDataImages();
  }, []);

  useEffect(() => {
    if (images.length === 0) return;

    const interval = setInterval(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        opacity.setValue(1);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [images]);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Harap masukkan email dan kata sandi");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });
      const data = response.data;
      login(data.user);

      if (data.token) {
        await AsyncStorage.setItem("token", data.token);
        console.log("🔑 Token saved:", data.token);
      }

      await AsyncStorage.multiSet([
        ["token", data.token],
        ["roles", JSON.stringify(data.user.roles)],
        ["user", JSON.stringify(data.user)],
      ]);

      setIsLoading(false);
      router.replace("/(tabs)");
    } catch (err) {
      setError(
        err.response?.data?.message || err.response?.status === 401
          ? "Email atau password salah"
          : "Gagal masuk. Coba lagi."
      );
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../assets/images/background.jpg")}
      style={styles.container}
      resizeMode="cover"
      blurRadius={2}
    >
      <View style={styles.pageOverlay} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <View style={styles.sliderContainer}>
          {images.length > 0 && (
            <Animated.View style={[styles.sliderImageWrapper, { opacity }]}>
              {/* Gambar slider */}
              <Image
                source={{
                  uri: `${API_URL_IMAGE}/${images[currentIndex].image_url}`,
                }}
                style={styles.sliderImage}
                contentFit="cover"
                transition={600}
                cachePolicy="memory-disk"
              />

              {/* Overlay gelap agar teks terbaca */}
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.2)", "rgba(0,0,0,0.5)"]}
                style={styles.overlay}
              />

              {/* Teks di atas gambar */}
              <View style={styles.sliderTextContainer}>
                <Text style={styles.sliderTitle}>
                  {images[currentIndex].title}
                </Text>
                <Text style={styles.sliderSubtitle}>
                  {images[currentIndex].sub_title}
                </Text>
              </View>

              {/* Dots */}
              <View style={styles.dotsContainer}>
                {images.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      {
                        backgroundColor:
                          i === currentIndex
                            ? "#FFD166"
                            : "rgba(255, 255, 255, 0.6)",
                      },
                    ]}
                  />
                ))}
              </View>
            </Animated.View>
          )}
        </View>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/images/logo.png")}
              style={styles.logo}
              contentFit="contain"
              transition={1000}
            />
          </View>
          <Text style={styles.subtitle}>
            Masuk dengan akun Anda untuk akses sistem
          </Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Mail size={20} color="#FFFFFF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#E2E8F0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color="#FFFFFF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Kata Sandi"
                placeholderTextColor="#E2E8F0"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#CBD5E1" />
                ) : (
                  <Eye size={20} color="#CBD5E1" />
                )}
              </TouchableOpacity>
            </View>

            <Button
              title="Masuk"
              onPress={handleLogin}
              loading={isLoading}
              style={styles.loginButton}
            />

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Belum punya akun? </Text>
              <Link href="/register" asChild>
                <TouchableOpacity>
                  <Text style={styles.registerLink}>Daftar di sini</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
  },

  sliderContainer: {
    height: 230,
    borderBottomLeftRadius: 80,
    borderBottomStartRadius: 80,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sliderImageWrapper: {
    flex: 1,
  },
  sliderImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "100%",
  },
  sliderTextContainer: {
    position: "absolute",
    bottom: 24,
    left: 35,
    maxWidth: "75%",
  },
  sliderTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  sliderSubtitle: {
    fontSize: 14,
    color: "#E2E8F0",
    marginTop: 4,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  dotsContainer: {
    position: "absolute",
    bottom: 12,
    right: 16,
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  logo: {
    width: 180,
    height: 90,
  },
  subtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 28,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },

  errorText: {
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 16,
    fontSize: 14,
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },

  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    paddingVertical: 14,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 6,
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  registerText: {
    color: "#CBD5E1",
    fontSize: 15,
  },
  registerLink: {
    color: "#FFD166",
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 4,
  },
  formCard: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  pageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
});

import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { User, Mail, Lock, Eye, EyeOff, BookUser } from "lucide-react-native";
import theme from "@/constants/theme";
import Button from "@/components/Button";
import { Image } from "expo-image";

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notelp, setNoTelp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const getPhoneNumberError = (notelp) => {
    if (!notelp) return null;
    if (typeof notelp !== "string") return "Nomor HP harus berupa teks";
    if (!/^\d+$/.test(notelp)) return "Nomor HP hanya boleh berisi angka";
    if (!notelp.startsWith("08")) return "Nomor HP harus diawali dengan '08'";
    if (notelp.length < 10 || notelp.length > 13)
      return "Nomor HP harus terdiri dari 10–13 digit";
    return null;
  };

  const handleRegister = async (text) => {
    if (!name || !email || !password || !confirmPassword || !notelp) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const phoneError = getPhoneNumberError(notelp);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: name,
            email,
            password,
            no_telp: notelp,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      const data = await response.json();
      console.log(data);
      router.replace("/login");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      console.error("Registration error:", err);
    } finally {
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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/images/logo.png")}
              style={{ width: 200, height: 100 }}
              contentFit="contain"
              transition={1000}
            />
          </View>

          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join KAKOBA&apos;s member today</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <User
                size={20}
                color={theme.colors.white}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Mail
                size={20}
                color={theme.colors.white}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <BookUser
                size={20}
                color={theme.colors.white}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="No.Telp"
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                value={notelp}
                keyboardType="phone-pad"
                onChangeText={setNoTelp}
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock
                size={20}
                color={theme.colors.white}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color={theme.colors.white} />
                ) : (
                  <Eye size={20} color={theme.colors.white} />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Lock
                size={20}
                color={theme.colors.white}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color={theme.colors.white} />
                ) : (
                  <Eye size={20} color={theme.colors.white} />
                )}
              </TouchableOpacity>
            </View>

            <Button
              title="Daftar"
              onPress={handleRegister}
              loading={isLoading}
              style={styles.registerButton}
            />

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Sudah punya akun?</Text>
              <Link href="/login" asChild>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={styles.loginLink}>Login</Text>
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
  pageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  formCard: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: theme.spacing.l,
  },
  backButton: {
    position: "absolute",
    top: theme.spacing.xl,
    left: theme.spacing.l,
    zIndex: 10,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  title: {
    ...theme.typography.h1,
    fontSize: 32,
    color: theme.colors.white,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: theme.spacing.s,
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
    color: theme.colors.accent,
    textAlign: "center",
    marginBottom: theme.spacing.m,
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
    marginRight: theme.spacing.m,
  },
  input: {
    flex: 1,
    color: theme.colors.white,
    paddingVertical: theme.spacing.m,
    ...theme.typography.body,
  },
  eyeIcon: {
    padding: theme.spacing.s,
  },
  registerButton: {
    marginTop: theme.spacing.m,
    marginBottom: theme.spacing.l,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },

  loginText: {
    color: "#E2E8F0",
    fontSize: 15,
  },

  loginLink: {
    color: "#FFD166",
    fontSize: 15,
    fontWeight: "800",
    marginLeft: 6,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});

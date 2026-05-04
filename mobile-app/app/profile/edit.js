import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import theme from "@/constants/theme";
import { useUserStore } from "@/store/userStore";
import Button from "@/components/Button";
import { Camera } from "lucide-react-native";
import axiosInstance from "../utils/axiosInstance";

export default function EditProfileScreen() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const updateAvatar = useUserStore((state) => state.updateAvatar);
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [notelp, setNoTelp] = useState(user?.no_telp || "");
  const [isLoading, setIsLoading] = useState(false);
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const API_URL_IMAGE = process.env.EXPO_PUBLIC_API_URL_IMAGE;

  if (!user) return null;

  const getPhoneNumberError = (notelp) => {
    if (!notelp) return null;
    if (!/^\d+$/.test(notelp)) return "Phone number must contain only digits";
    if (!notelp.startsWith("08")) return "Phone number must start with '08'";
    if (notelp.length < 10 || notelp.length > 13)
      return "Phone number must be 10-13 digits";
    return null;
  };

  const handleUpdateProfile = async () => {
    if (!username.trim() || !email.trim()) {
      Alert.alert("Validation Error", "Username and email cannot be empty");
      return;
    }

    const phoneError = getPhoneNumberError(notelp);
    if (phoneError) {
      Alert.alert("Invalid Phone", phoneError);
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      formData.append("no_telp", notelp);
      formData.append("roles", "USER");

      if (user.profile_picture && user.profile_picture.startsWith("file")) {
        const uriParts = user.profile_picture.split(".");
        const extension = uriParts[uriParts.length - 1];

        formData.append("profile_picture", {
          uri: user.profile_picture,
          name: `avatar_${user.id}.${extension}`,
          type: `image/${extension}`,
        });
      }

      const response = await axiosInstance.put(
        `${API_URL}/user/${user.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const updatedUser = response.data.data;
      setUser(updatedUser);

      Alert.alert("Success", "Profile updated successfully!");
      router.back();
    } catch (error) {
      console.error("Update profile error:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to update profile";
      Alert.alert("Error", message);
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please allow access to photo library."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      updateAvatar(result.assets[0].uri);
    }
  };

  const avatarUri = user.profile_picture
    ? user.profile_picture.startsWith("http") ||
      user.profile_picture.startsWith("file")
      ? user.profile_picture
      : `${API_URL_IMAGE}/${user.profile_picture}`
    : "https://via.placeholder.com/120";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: avatarUri }} style={styles.avatar} />

        <View style={styles.avatarActions}>
          <TouchableOpacity style={styles.avatarButton} onPress={pickImage}>
            <Camera size={20} color={theme.colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your full name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>No.Telp</Text>
          <TextInput
            style={styles.input}
            value={notelp}
            onChangeText={setNoTelp}
            placeholder="Enter your No.Telp"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Membership</Text>
          <View style={styles.readOnlyInput}>
            <Text style={styles.readOnlyText}>
              {user.roles?.[0] === "ADMIN" ? "Admin" : "Member Kakoba"}
            </Text>
          </View>
          <Text style={styles.helperText}>
            Membership level is based on your points and cannot be changed
            manually.
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>User ID</Text>
          <View style={styles.readOnlyInput}>
            <Text style={styles.readOnlyText}>#{user.id}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          title="Save Changes"
          onPress={handleUpdateProfile}
          loading={isLoading}
          style={styles.saveButton}
        />

        <Button
          title="Cancel"
          onPress={() => router.back()}
          variant="outline"
          style={styles.cancelButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: theme.spacing.l,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: theme.spacing.xl,
    position: "relative",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  avatarActions: {
    position: "absolute",
    bottom: 0,
    right: "35%",
    flexDirection: "row",
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: theme.spacing.xs,
  },
  form: {
    marginBottom: theme.spacing.xl,
  },
  inputGroup: {
    marginBottom: theme.spacing.l,
  },
  label: {
    ...theme.typography.body,
    fontWeight: "600",
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.m,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: Platform.OS === "ios" ? theme.spacing.m : theme.spacing.s,
    ...theme.typography.body,
  },
  readOnlyInput: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.m,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.m,
  },
  readOnlyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  helperText: {
    ...theme.typography.caption,
    marginTop: theme.spacing.xs,
  },
  actions: {
    marginBottom: theme.spacing.xl,
  },
  saveButton: {
    marginBottom: theme.spacing.m,
  },
  cancelButton: {},
});

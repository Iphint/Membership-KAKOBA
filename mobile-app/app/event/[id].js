/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import theme from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Button from "@/components/Button";
import { Tag, Clock, MapPin } from "lucide-react-native";
import axiosInstance, { setAxiosAuthToken } from "../utils/axiosInstance";
import loadingUtils from "../utils/loading";
import errorUtils from "../utils/error";

const { width } = Dimensions.get("window");

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL_IMAGE = process.env.EXPO_PUBLIC_API_URL_IMAGE;

  const fetchEvent = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      setAxiosAuthToken(token);
      const res = await axiosInstance.get(`/event/${id}`);
      setEventData(res.data.data);
    } catch (err) {
      setError("Failed to load event details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return loadingUtils();
  }

  if (error || !eventData) {
    return errorUtils(error);
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: eventData.event_name }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.sliderContainer}
        >
          {eventData.ImageEvent && eventData.ImageEvent.length > 0 ? (
            eventData.ImageEvent.map((img, index) => (
              <Image
                key={index}
                source={{
                  uri: `${API_URL_IMAGE}/${encodeURIComponent(img.image_url)}`,
                }}
                style={styles.sliderImage}
                resizeMode="cover"
              />
            ))
          ) : (
            <View style={[styles.sliderImage, styles.placeholderImage]}>
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{eventData.event_name}</Text>
            <View style={styles.categoryContainer}>
              <Tag size={16} color={theme.colors.primary} />
              <Text style={styles.category}>Event</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <MapPin size={18} color={theme.colors.primary} />
              <Text style={styles.infoText}>{eventData.location || "—"}</Text>
            </View>
            <View style={styles.infoItem}>
              <Clock size={18} color={theme.colors.primary} />
              <Text style={styles.infoText}>
                {formatDate(eventData.event_date)}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {eventData.description || "No description available."}
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Fixed Button */}
      <View style={styles.bottomButtonContainer}>
        <Button
          title="Get More Info"
          onPress={() => {
            alert("More information will be available soon.");
          }}
          style={styles.infoButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  content: {
    padding: theme.spacing.l,
  },
  header: {
    marginBottom: theme.spacing.m,
  },
  title: {
    ...theme.typography.h1,
    marginBottom: theme.spacing.s,
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  category: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    marginLeft: theme.spacing.xs,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.xl,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  infoText: {
    ...theme.typography.body,
    marginLeft: theme.spacing.xs,
    flexShrink: 1,
  },
  sectionTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.s,
  },
  description: {
    ...theme.typography.body,
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  },
  sliderContainer: {
    width: "100%",
    height: 250,
    marginBottom: 16,
  },
  sliderImage: {
    width: width,
    height: 250,
  },
  placeholderImage: {
    backgroundColor: theme.colors.card,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  bottomButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.l,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.m,
  },
  infoButton: {
    paddingVertical: theme.spacing.m,
  },
});

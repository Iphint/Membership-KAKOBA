/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import theme from "@/constants/theme";
import axiosInstance, { setAxiosAuthToken } from "../../utils/axiosInstance";
import EventCard from "../../../components/EventCard";
import LoadingUtils from "../../utils/loading";
import { RefreshCcw } from "lucide-react-native";
import errorUtils from "../../utils/error";

export default function EventsScreen() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const API_URL_IMAGE = process.env.EXPO_PUBLIC_API_URL_IMAGE;

  const rotation = useRef(new Animated.Value(0)).current;

  const startRefreshAnimation = () => {
    rotation.setValue(0);

    Animated.timing(rotation, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const rotateStyle = {
    transform: [
      {
        rotate: rotation.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "360deg"],
        }),
      },
    ],
  };

  const fetchDataEvents = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.warn("No token found");
        return;
      }
      setAxiosAuthToken(token);

      const res = await axiosInstance.get(`${API_URL}/events`);
      const data = res.data.data;
      const sortedData = [...data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setEvents(sortedData);
      setError(false);
    } catch (error) {
      setError(true);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataEvents();
  }, []);

  const handleProductPress = useCallback(
    (event) => {
      router.push(`/event/${event.id}`);
    },
    [router]
  );

  const renderItem = useCallback(
    ({ item }) => (
      <EventCard
        title="View"
        product={{
          id: item.id,
          name: item.event_name,
          image: item.ImageEvent?.[0]
            ? `${API_URL_IMAGE}/${item.ImageEvent[0].image_url}`
            : null,
          location: item.location,
          description: item.description,
          points: item.event_date,
        }}
        onPress={handleProductPress}
      />
    ),
    [API_URL_IMAGE, handleProductPress]
  );

  const onRefresh = () => {
    setRefreshing(true);
    startRefreshAnimation();
    try {
      fetchDataEvents();
    } catch (error) {
      setError(true);
      setError(error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading && refreshing) {
    return <LoadingUtils />;
  }

  if (error) {
    return errorUtils(error);
  }

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: theme.spacing.l,
        }}
      >
        <Text style={styles.title}>Info Event</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Animated.View style={rotateStyle}>
            <RefreshCcw color={theme.colors.primary} size={30} />
          </Animated.View>
        </TouchableOpacity>
      </View>
      {(events ?? []).length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No events yet</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.l,
    paddingTop: 70,
  },
  title: {
    ...theme.typography.h1,
  },
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  loadingText: {
    ...theme.typography.bodySmall,
    marginTop: theme.spacing.m,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import theme from "@/constants/theme";
import { useUserStore } from "@/store/userStore";
import Card from "@/components/Card";
import {
  Gift,
  Award,
  ArrowRight,
  Newspaper,
  Calendar,
  HandCoins,
} from "lucide-react-native";
import axiosInstance, { setAxiosAuthToken } from "../../utils/axiosInstance";

export default function HomeScreen() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [points, setPoints] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const API_URL_IMAGE = process.env.EXPO_PUBLIC_API_URL_IMAGE;

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }
      setAxiosAuthToken(token);

      const [productsRes, pointsRes] = await Promise.all([
        axiosInstance.get("/products-featured"),
        axiosInstance.get("/points/user"),
      ]);
      
      const data = productsRes.data.data;
      const sortedData = [...data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )
      setFeaturedProducts(sortedData);
      setPoints(pointsRes.data.data || 0);
    } catch (error) {
      console.error(
        "Error fetching data:",
        error.response?.data || error.message
      );
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  if (!user) return null;

  let level = "";
  if (points?.point_balance > 5000) level = "Platinum";
  else if (points?.point_balance > 2000) level = "Gold";
  else if (points?.point_balance > 1000) level = "Silver";
  else level = "Bronze";

  const renderDataFeatured = ({ item: product }) => (
    <TouchableOpacity
      key={product.id}
      onPress={() => router.push(`/product/${product.id}`)}
    >
      <Card style={styles.productCard}>
        <Image
          source={{
            uri: `${API_URL_IMAGE}/${product.ImagePromo[0]?.image_url}`,
          }}
          style={styles.productImage}
        />
        <View style={styles.productContent}>
          <Text style={styles.productName}>{product.product_name}</Text>
          <Text style={styles.productDescription} numberOfLines={2}>
            {product.product_description}
          </Text>
          <View style={styles.productFooter}>
            <Text style={styles.productPoints}>
              {product.product_point} points
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={featuredProducts}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderDataFeatured}
      ListHeaderComponent={
        <>
          {/* Header user */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>
                Hi, {user.username.split(" ")[0]}!
              </Text>
              <Text style={styles.subGreeting}>Selamat datang</Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/profile")}>
              <Image
                source={{
                  uri: user?.profile_picture
                    ? `${API_URL_IMAGE}/${user.profile_picture}`
                    : 'https://avatar.iran.liara.run/public/25',
                }}
                style={styles.avatar}
              />
            </TouchableOpacity>
          </View>

          {/* Card Poin */}
          <Card style={styles.pointsCard}>
            <View style={styles.pointsContent}>
              <View>
                <Text style={styles.pointsLabel}>Point saya</Text>
                <Text style={styles.pointsValue}>
                  {points?.point_balance ?? 0}
                </Text>
              </View>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>{level}</Text>
              </View>
            </View>
          </Card>

          {/* Pintasan */}
          <Text style={styles.sectionTitle}>Pintasan</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.actionsContainer}
          >
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => router.push("/products")}
            >
              <View style={[styles.actionIcon, { backgroundColor: "#E3F2FD" }]}>
                <Gift size={24} color="#2196F3" />
              </View>
              <Text style={styles.actionText}>Claim</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => router.push("/membership")}
            >
              <View style={[styles.actionIcon, { backgroundColor: "#E8F5E9" }]}>
                <Award size={24} color="#4CAF50" />
              </View>
              <Text style={styles.actionText}>Membership</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
              <View style={[styles.actionIcon, { backgroundColor: "#FFF3E0" }]}>
                <HandCoins size={24} color="#FF9800" />
              </View>
              <Text style={styles.actionText}>Penawaran</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
              <View style={[styles.actionIcon, { backgroundColor: "#F3E5F5" }]}>
                <Calendar size={24} color="#9C27B0" />
              </View>
              <Text style={styles.actionText}>Events</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
              <View style={[styles.actionIcon, { backgroundColor: "#E1F5FE" }]}>
                <Newspaper size={24} color="#03A9F4" />
              </View>
              <Text style={styles.actionText}>Berita</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Hot promo header */}
          <View style={styles.featuredHeader}>
            <Text style={styles.sectionTitle}>Hot promo</Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => router.push("/products")}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <ArrowRight size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </>
      }
      ListEmptyComponent={
        <Text style={{ textAlign: "center", marginTop: 20 }}>
          Belum ada promo tersedia.
        </Text>
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
          title="Memuat ulang..."
        />
      }
      contentContainerStyle={{
        padding: theme.spacing.l,
        paddingBottom: 100,
      }}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.l,
  },
  header: {
    flexDirection: "row",
    marginTop: theme.spacing.xxl,
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.l,
  },
  greeting: {
    ...theme.typography.h1,
    marginBottom: theme.spacing.xs,
  },
  subGreeting: {
    ...theme.typography.bodySmall,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  pointsCard: {
    backgroundColor: theme.colors.primary,
    marginBottom: theme.spacing.l,
  },
  pointsContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pointsLabel: {
    ...theme.typography.body,
    color: theme.colors.white,
    opacity: 0.9,
    marginBottom: theme.spacing.xs,
  },
  pointsValue: {
    ...theme.typography.h1,
    color: theme.colors.white,
    fontSize: 32,
  },
  levelBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.round,
  },
  levelText: {
    ...theme.typography.body,
    color: theme.colors.white,
    fontWeight: "600",
  },
  sectionTitle: {
    ...theme.typography.h2,
    marginBottom: theme.spacing.m,
  },
  actionsContainer: {
    marginBottom: theme.spacing.xl,
  },
  actionItem: {
    alignItems: "center",
    marginRight: theme.spacing.m,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.s,
  },
  actionText: {
    ...theme.typography.body,
  },
  featuredHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.m,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    marginRight: theme.spacing.xs,
  },
  productCard: {
    flexDirection: "row",
    padding: 0,
    overflow: "hidden",
    marginBottom: theme.spacing.m,
  },
  productImage: {
    width: 100,
    height: "100%",
    borderTopLeftRadius: theme.radius.m,
    borderBottomLeftRadius: theme.radius.m,
  },
  productContent: {
    flex: 1,
    padding: theme.spacing.m,
  },
  productName: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.xs,
  },
  productDescription: {
    ...theme.typography.bodySmall,
    marginBottom: theme.spacing.s,
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  productPoints: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: "600",
  },
});

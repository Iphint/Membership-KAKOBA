import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  Platform,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import theme from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Button from "@/components/Button";
import { useUserStore } from "@/store/userStore";
import { Tag, Clock, Award } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import axiosInstance, { setAxiosAuthToken } from "../utils/axiosInstance";
import LoadingUtils from "../utils/loading";
import errorUtils from "../utils/error";
const { width } = Dimensions.get("window");

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const [dataUserPoint, setDataUserPoint] = useState(null);
  const API_URL_IMAGE = process.env.EXPO_PUBLIC_API_URL_IMAGE;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          router.replace("/login");
          return;
        }

        setAxiosAuthToken(token);
        const res = await axiosInstance.get(`/product-promo/${id}`);
        setProduct(res.data.data);
        console.log();
      } catch (err) {
        setError("Failed to load product", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchDataPointsUser = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          router.replace("/login");
          return;
        }
        setAxiosAuthToken(token);
        const res = await axiosInstance.get(`/user/${user.id}`);
        const userData = res.data.data;
        setDataUserPoint(userData);
      } catch (error) {
        setError("Failed to load user data");
        if (error?.response?.status === 401) {
          await AsyncStorage.removeItem("token");
          router.replace("/login");
        }
      }
    };

    fetchDataPointsUser();
    fetchProduct();
  }, [id, router, user.id]);

  if (!product || !user) return null;
  const totalPointsNeeded = product.product_point * quantity;
  const canRedeem =
    dataUserPoint?.Point?.[0]?.point_balance >= product.product_point;

  const handleIncrease = () => {
    if (quantity < product.stock) setQuantity(quantity + 1);
  };

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleRedeem = async () => {
    if (!canRedeem) return;

    try {
      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
      }

      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }

      setAxiosAuthToken(token);

      const payload = {
        items: [
          {
            product_id: product.id,
            name_product_transaction: product.product_name,
            price_product_transaction: product.product_point,
            quantity_product_transaction: quantity,
          },
        ],
        point_transaction: totalPointsNeeded,
        type: "redeem",
      };

      await axiosInstance.post("/reedem-transaction", payload);

      alert("🎉 Redeem berhasil! Silakan cek reward kamu.");
      router.back();
    } catch (error) {
      const message = error?.response?.data?.message;
      if (message === "INSUFFICIENT_POINTS") {
        alert("⚠️ Point kamu tidak mencukupi untuk menukarkan reward ini.");
        return;
      }
      if (error.response?.status === 401) {
        alert("Sesi kamu telah habis. Silakan login kembali.");
        router.replace("/login");
        return;
      }
      alert(
        "😔 Maaf, reward ini baru saja habis karena diredeem user lain lebih dulu."
      );
    }
  };

  if (loading) {
    return <LoadingUtils />;
  }

  if (error) {
    return errorUtils(error);
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Stack.Screen options={{ title: product.product_name }} />

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.sliderContainer}
      >
        {product.ImagePromo.map((img, index) => (
          <Image
            key={index}
            source={{ uri: `${API_URL_IMAGE}/${img.image_url}` }}
            style={styles.sliderImage}
            resizeMode="cover"
          />
        ))}
      </ScrollView>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{product.product_name}</Text>
          <View style={styles.categoryContainer}>
            <Tag size={16} color={theme.colors.primary} />
            <Text style={styles.category}>{product.product_category}</Text>
          </View>
        </View>
        <View style={styles.pointsContainerParent}>
          <View style={styles.pointsContainer}>
            <Text style={styles.pointsValue}>{product.stock}</Text>
            <Text style={styles.pointsLabel}>Available</Text>
          </View>

          <View style={styles.pointsContainer}>
            <Text style={styles.pointsValue}>{product.product_point}</Text>
            <Text style={styles.pointsLabel}>Points</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{product.product_description}</Text>

        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Clock size={20} color={theme.colors.primary} />
            <Text style={styles.infoText}>Available for a limited time</Text>
          </View>
          <View style={styles.infoItem}>
            <Award size={20} color={theme.colors.primary} />
            <Text style={styles.infoText}>Exclusive to KAKOBA members</Text>
          </View>
        </View>
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Your current balance:</Text>
          <Text style={styles.balanceValue}>
            {dataUserPoint?.Point?.[0]?.point_balance} points
          </Text>
        </View>

        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>Select Quantity:</Text>
          <View style={styles.quantityControls}>
            <Text style={styles.quantityButton} onPress={handleDecrease}>
              -
            </Text>
            <Text style={styles.quantityValue}>{quantity}</Text>
            <Text style={styles.quantityButton} onPress={handleIncrease}>
              +
            </Text>
          </View>
        </View>

        <View style={styles.totalPointsContainer}>
          <Text style={styles.totalPointsText}>
            Total Points Needed: {totalPointsNeeded}
          </Text>
        </View>

        {!canRedeem && (
          <Text style={styles.insufficientPoints}>
            You need{" "}
            {totalPointsNeeded - dataUserPoint?.Point?.[0]?.point_balance} more
            points to redeem this reward
          </Text>
        )}

        <Button
          title={canRedeem ? "Redeem Now" : "Not Enough Points"}
          onPress={handleRedeem}
          disabled={!canRedeem}
          style={styles.redeemButton}
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
  image: {
    width: "100%",
    height: 250,
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
  pointsContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: theme.spacing.xl,
  },
  pointsContainerParent: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.l,
    paddingTop: theme.spacing.xl,
    marginBottom: theme.spacing.m,
    backgroundColor: theme.colors.card,
  },

  pointsValue: {
    ...theme.typography.h1,
    color: theme.colors.primary,
    marginRight: theme.spacing.xs,
  },
  pointsLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
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
  infoContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.xl,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.s,
  },
  infoText: {
    ...theme.typography.body,
    marginLeft: theme.spacing.s,
  },
  balanceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.m,
  },
  balanceLabel: {
    ...theme.typography.body,
  },
  balanceValue: {
    ...theme.typography.body,
    fontWeight: "600",
  },
  insufficientPoints: {
    ...theme.typography.bodySmall,
    color: theme.colors.error,
    textAlign: "center",
    marginBottom: theme.spacing.m,
  },
  redeemButton: {
    paddingVertical: theme.spacing.m,
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
  quantityContainer: {
    marginBottom: theme.spacing.m,
    alignItems: "center",
  },
  quantityLabel: {
    ...theme.typography.body,
    marginBottom: theme.spacing.s,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.s,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
  },
  quantityButton: {
    fontSize: 24,
    paddingHorizontal: theme.spacing.l,
    color: theme.colors.primary,
    fontWeight: "bold",
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: "600",
    marginHorizontal: theme.spacing.m,
  },
  totalPointsContainer: {
    alignItems: "center",
    marginBottom: theme.spacing.m,
  },
  totalPointsText: {
    ...theme.typography.body,
    fontWeight: "600",
  },
});

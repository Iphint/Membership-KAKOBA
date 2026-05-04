/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import theme from "@/constants/theme";
import ProductCard from "@/components/ProductCard";
import CategoryFilter from "@/components/CategoryFilter";
import { RefreshCcw } from "lucide-react-native";
import axiosInstance, { setAxiosAuthToken } from "../../utils/axiosInstance";

export default function ProductsScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const API_URL_IMAGE = process.env.EXPO_PUBLIC_API_URL_IMAGE;

  const fetchDataProducts = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.warn("No token found");
        return;
      }
      setAxiosAuthToken(token);

      const res = await axiosInstance.get(`${API_URL}/product-promos`);
      const data = res.data.data;
      const sortedData = [...data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setProducts(sortedData);
    } catch (error) {
      console.error(
        "Error fetching products:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataProducts();
  }, []);

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

  const categories = [
    ...Array.from(
      new Set(
        products
          .map((product) => product.product_category)
          .filter((cat) => cat && cat.toLowerCase() !== "all")
      )
    ),
  ];

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter(
          (product) => product.product_category === selectedCategory
        );

  const handleProductPress = useCallback(
    (product) => {
      router.push(`/product/${product.id}`);
    },
    [router]
  );

  const renderItem = useCallback(
    ({ item }) => (
      <ProductCard
        title="Reedem"
        product={{
          id: item.id,
          name: item.product_name,
          image: item.ImagePromo?.[0]
            ? `${API_URL_IMAGE}/${item.ImagePromo[0].image_url}`
            : null,
          price: item.price_normal,
          discount: item.discount,
          category: item.product_category,
          points: item.product_point,
        }}
        onPress={handleProductPress}
      />
    ),
    [API_URL_IMAGE, handleProductPress]
  );

  const onRefresh = async () => {
    setRefreshing(true);
    startRefreshAnimation();
    await fetchDataProducts();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={styles.title}>Rewards Catalog</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Animated.View style={rotateStyle}>
            <RefreshCcw color={theme.colors.primary} size={30} />
          </Animated.View>
        </TouchableOpacity>
      </View>

      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} />
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderItem}
          refreshing={refreshing}
          onRefresh={onRefresh}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
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
    marginBottom: theme.spacing.m,
  },
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
});

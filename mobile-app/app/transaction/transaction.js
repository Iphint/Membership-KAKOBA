/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useUserStore } from "@/store/userStore";
import theme from "../../constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance, { setAxiosAuthToken } from "../utils/axiosInstance";
import errorUtils from "../utils/error";
import LoadingUtils from "../utils/loading";
import { router } from "expo-router";

const PAGE_SIZE = 10;

export default function TransactionScreen() {
  const user = useUserStore((state) => state.user);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
  });

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const getTransactions = async (page = 1, shouldAppend = false) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.warn("No token found");
        return;
      }
      if (!user?.id) {
        console.warn("User ID is undefined");
        return;
      }

      setAxiosAuthToken(token);
      const res = await axiosInstance.get(`/transactions/user/${user.id}`, {
        params: { page, limit: PAGE_SIZE },
      });
      const data = res.data.data || [];
      const sortedData = [...data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setTransactions((prev) =>
        shouldAppend ? [...prev, ...sortedData] : sortedData
      );
      setPagination(
        res.data.pagination || {
          currentPage: page,
          totalPages: page,
          hasNextPage: false,
        }
      );
    } catch (error) {
      console.warn("Failed to fetch transactions:", error);
      setError(true);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const handleProductPress = useCallback(
    (transaction) => {
      router.push(`/transaction/qr/${transaction.id}`);
    },
    [router]
  );

  useEffect(() => {
    getTransactions(1);
  }, [API_URL, user]);

  const onRefresh = () => {
    setRefreshing(true);
    try {
      getTransactions(1);
    } catch (error) {
      setError(true);
      setError(error);
    } finally {
      setRefreshing(false);
    }
  };

  const loadMoreTransactions = async () => {
    if (loadingMore || refreshing || !pagination.hasNextPage) return;

    setLoadingMore(true);
    await getTransactions(pagination.currentPage + 1, true);
  };
  const renderTransactionItem = ({ item }) => {
    const isEarn = item.type === "earn";
    const totalAmount = item.items.reduce(
      (sum, product) =>
        sum +
        product.price_product_transaction *
          product.quantity_product_transaction,
      0
    );

    const qrAvailable = item.qr_code_used === false;
    const qrTokenAvailable = item.qr_code_token !== null;

    return (
      <View style={styles.transactionCard}>
        <View style={styles.header}>
          <View>
            <Text style={styles.typeText}>
              {isEarn ? "Points Earned" : "Purchase"}
            </Text>
            <Text style={styles.dateText}>
              {new Date(item.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </View>
          <Text
            style={[
              styles.pointAmount,
              { color: isEarn ? theme.colors.success : theme.colors.error },
            ]}
          >
            {isEarn ? "+" : "-"}
            {item.point_transaction} pts
          </Text>
        </View>
        <View style={styles.itemsContainer}>
          {item.items.map((product) => (
            <View key={product.id} style={styles.productRow}>
              <Text style={styles.productName}>
                {product.name_product_transaction}
              </Text>
              <Text style={styles.productPrice}>
                {product.quantity_product_transaction} × Rp
                {product.price_product_transaction.toLocaleString("id-ID")}
              </Text>
            </View>
          ))}
        </View>
        <Text style={styles.totalText}>
          Total: Rp{totalAmount.toLocaleString("id-ID")}
        </Text>
        {qrAvailable && qrTokenAvailable ? (
          <TouchableOpacity
            onPress={() => handleProductPress(item)}
            style={{ marginTop: theme.spacing.m }}
          >
            <Image
              style={styles.imageQr}
              source={require("@/assets/images/qr_example.png")}
            />
          </TouchableOpacity>
        ) : null}
        {!qrAvailable ? (
          <Text style={styles.dateText}>QR Code has been used</Text>
        ) : null}
      </View>
    );
  };

  if (loading) {
    return <LoadingUtils />;
  }

  if (error) {
    return errorUtils(error);
  }

  return (
    <View style={styles.container}>
      {(transactions ?? []).length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No transactions yet</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
          onEndReached={loadMoreTransactions}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loadingMore ? (
              <Text style={styles.loadingMoreText}>Loading more...</Text>
            ) : null
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.m,
  },
  title: {
    ...theme.typography.h2,
    textAlign: "center",
    marginBottom: theme.spacing.l,
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
  errorText: {
    ...theme.typography.body,
    color: theme.colors.error,
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    ...theme.typography.h4,
    color: theme.colors.textSecondary,
  },
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
  loadingMoreText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginVertical: theme.spacing.m,
  },
  transactionCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.s,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing.m,
  },
  typeText: {
    ...theme.typography.h4,
    fontWeight: "700",
    color: theme.colors.text,
  },
  dateText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  pointAmount: {
    ...theme.typography.h3,
    fontWeight: "700",
  },
  itemsContainer: {
    marginBottom: theme.spacing.m,
  },
  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.xs,
  },
  productName: {
    ...theme.typography.body,
    flex: 1,
    color: theme.colors.text,
  },
  productPrice: {
    ...theme.typography.body,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.s,
  },
  totalText: {
    ...theme.typography.body,
    fontWeight: "700",
    textAlign: "right",
    color: theme.colors.primary,
  },
  imageQr: {
    width: 30,
    height: 30,
  },
});

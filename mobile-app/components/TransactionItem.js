import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import theme from "@/constants/theme";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react-native";

export default function TransactionItem({ transaction }) {
  const isEarn = transaction.type === "earn";
  
  return (
    <TouchableOpacity on>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          {isEarn ? (
            <ArrowUpCircle color={theme.colors.success} size={24} />
          ) : (
            <ArrowDownCircle color={theme.colors.error} size={24} />
          )}
        </View>
        <View style={styles.content}>
          <Text style={styles.date}>
            {new Date(transaction.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.pointsContainer}>
          <Text
            style={[
              styles.points,
              isEarn ? styles.earnPoints : styles.redeemPoints,
            ]}
          >
            {isEarn ? "+" : "-"}
            {transaction.point_transaction}
          </Text>
          <Text style={styles.pointsLabel}>points</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  iconContainer: {
    marginRight: theme.spacing.m,
  },
  content: {
    flex: 1,
  },
  description: {
    ...theme.typography.body,
    marginBottom: theme.spacing.xs,
  },
  date: {
    ...theme.typography.caption,
  },
  pointsContainer: {
    alignItems: "flex-end",
  },
  points: {
    ...theme.typography.h3,
    fontSize: 16,
  },
  earnPoints: {
    color: theme.colors.success,
  },
  redeemPoints: {
    color: theme.colors.error,
  },
  pointsLabel: {
    ...theme.typography.caption,
  },
});
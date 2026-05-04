import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import React from "react";
import theme from "../../constants/theme";

export default function LoadingUtils() {
  return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={styles.loadingText}>Loading transactions...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
});

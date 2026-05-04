import React from "react";
import { StyleSheet, View } from "react-native";
import theme from "@/constants/theme";

export default function Card({ children, style, elevation = true }) {
  return (
    <View
      style={[
        styles.card,
        elevation && styles.elevation,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.m,
    padding: theme.spacing.m,
    marginVertical: theme.spacing.s,
  },
  elevation: {
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
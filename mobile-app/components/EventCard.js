import React from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import theme from "@/constants/theme";
import Card from "./Card";
import Button from "./Button";

export default function EventCard({ product, onPress, title }) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={() => onPress(product)}>
      <Card style={styles.card}>
        <Image source={{ uri: product.image }} style={styles.image} />
        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={1}>
            {product.name}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {product.description}
          </Text>
          <View style={styles.footer}>
            <View style={styles.pointsContainer}>
              <Text style={styles.pointsValue}>{product.location.split(' ')[0]}...</Text>
            </View>
            <Button
              title={title}
              onPress={() => onPress(product)}
              size="small"
              style={styles.button}
            />
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: "hidden",
    width: theme.sizes.screenWidth / 2 - theme.spacing.l,
    marginHorizontal: theme.spacing.xs,
    marginBottom: theme.spacing.m,
  },
  image: {
    width: "100%",
    height: 120,
    borderTopLeftRadius: theme.radius.m,
    borderTopRightRadius: theme.radius.m,
  },
  content: {
    padding: theme.spacing.m,
  },
  name: {
    ...theme.typography.h3,
    fontSize: 16,
    marginBottom: theme.spacing.xs,
  },
  description: {
    ...theme.typography.bodySmall,
    marginBottom: theme.spacing.m,
  },
  footer: {
    flexDirection: "column",
    gap: theme.spacing.s,
    alignItems: "start",
  },
  pointsContainer: {
    flexDirection: "column",
  },
  pointsValue: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    fontSize: 18,
  },
  pointsLabel: {
    ...theme.typography.caption,
  },
  button: {
    minWidth: 80,
  },
});

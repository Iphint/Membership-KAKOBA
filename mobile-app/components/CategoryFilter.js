import React from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import theme from "@/constants/theme";

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          style={[
            styles.categoryItem,
            selectedCategory === "All" && styles.selectedCategory,
          ]}
          onPress={() => onSelectCategory("All")}
        >
          <Text
            style={[
              styles.categoryText,
              selectedCategory === "All" && styles.selectedCategoryText,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryItem,
              selectedCategory === category && styles.selectedCategory,
            ]}
            onPress={() => onSelectCategory(category)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.selectedCategoryText,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.m,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.m,
  },
  categoryItem: {
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.radius.round,
    marginRight: theme.spacing.s,
    backgroundColor: theme.colors.card,
  },
  selectedCategory: {
    backgroundColor: theme.colors.primary,
  },
  categoryText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  selectedCategoryText: {
    color: theme.colors.white,
    fontWeight: "600",
  },
});
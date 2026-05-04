import { StyleSheet, Text, View } from "react-native";
import React from "react";

export default function errorUtils(error) {
  return (
    <View style={styles.centered}>
      <Text style={styles.errorText}>⚠️ {error}</Text>
    </View>
  );
}

const styles = StyleSheet.create({});

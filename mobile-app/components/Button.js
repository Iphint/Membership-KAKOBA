import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import theme from "@/constants/theme";

export default function Button({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  style,
  textStyle,
}) {
  const getButtonStyle = () => {
    switch (variant) {
      case "primary":
        return styles.primaryButton;
      case "secondary":
        return styles.secondaryButton;
      case "outline":
        return styles.outlineButton;
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case "primary":
        return styles.primaryText;
      case "secondary":
        return styles.secondaryText;
      case "outline":
        return styles.outlineText;
      default:
        return styles.primaryText;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case "small":
        return styles.smallButton;
      case "medium":
        return styles.mediumButton;
      case "large":
        return styles.largeButton;
      default:
        return styles.mediumButton;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        getSizeStyle(),
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" ? theme.colors.primary : theme.colors.white}
          size="small"
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.radius.m,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  secondaryButton: {
    backgroundColor: theme.colors.accent,
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  smallButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.m,
  },
  mediumButton: {
    paddingVertical: theme.spacing.s,
    paddingHorizontal: theme.spacing.l,
  },
  largeButton: {
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.xl,
  },
  disabledButton: {
    opacity: 0.5,
  },
  primaryText: {
    ...theme.typography.button,
    color: theme.colors.white,
  },
  secondaryText: {
    ...theme.typography.button,
    color: theme.colors.text,
  },
  outlineText: {
    ...theme.typography.button,
    color: theme.colors.primary,
  },
});
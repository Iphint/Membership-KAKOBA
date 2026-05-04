import { Dimensions } from "react-native";
import colors from "./colors";

const { width, height } = Dimensions.get("window");

const theme = {
  colors,
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 40,
  },
  radius: {
    xs: 4,
    s: 8,
    m: 12,
    l: 16,
    xl: 24,
    xxl: 32,
    round: 999,
  },
  typography: {
    h1: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.text,
    },
    h2: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.text,
    },
    h3: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.text,
    },
    h4: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
    },
    body: {
      fontSize: 16,
      fontWeight: "400",
      color: colors.text,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: "400",
      color: colors.textSecondary,
    },
    caption: {
      fontSize: 12,
      fontWeight: "400",
      color: colors.textSecondary,
    },
    button: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.white,
    },
  },
  sizes: {
    screenWidth: width,
    screenHeight: height,
  },
};

export default theme;
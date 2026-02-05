/**
 * ShoFit Design System - Theme constants
 */

export const COLORS = {
  // Primary brand colors - From Figma (Black & Grey)
  primary: "#000000",
  primaryDark: "#111827",
  primaryLight: "#374151",

  // Secondary colors - From Figma (Grey tones)
  secondary: "#4B5563",
  secondaryDark: "#374151",
  secondaryLight: "#6B7280",

  // Accent colors
  accent: "#000000",
  accentDark: "#111827",

  // Gradient combinations
  gradients: {
    primary: ["#000000", "#111827", "#1F2937"],
    secondary: ["#4B5563", "#6B7280"],
    sunset: ["#FF6B6B", "#FF8E53", "#FFB347"],
    ocean: ["#667eea", "#764ba2"],
    mint: ["#11998e", "#38ef7d"],
    dark: ["#1a1a2e", "#16213e", "#0f3460"],
  },

  // Neutral colors
  white: "#FFFFFF",
  black: "#000000",
  gray: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
  },

  // Semantic colors
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",

  // Background colors
  background: {
    light: "#FFFFFF",
    dark: "#0A0A0F",
    card: {
      light: "#F9FAFB",
      dark: "#1A1A2E",
    },
  },

  // Text colors
  text: {
    light: {
      primary: "#111827",
      secondary: "#6B7280",
      muted: "#9CA3AF",
    },
    dark: {
      primary: "#F9FAFB",
      secondary: "#D1D5DB",
      muted: "#9CA3AF",
    },
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
};

export const FONT_FAMILY = {
  regular: "TenorSans_400Regular",
  system: "System",
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 48,
  hero: 64,
};

export const FONT_WEIGHTS = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
  extrabold: "800" as const,
};

export const SHADOWS = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  glow: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
};

export const ANIMATION = {
  fast: 200,
  normal: 300,
  slow: 500,
  spring: {
    damping: 15,
    stiffness: 150,
  },
};

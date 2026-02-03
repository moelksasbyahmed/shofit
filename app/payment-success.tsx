import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming,
} from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from "@/constants/design";

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const checkScale = useSharedValue(0);
  const checkOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(30);

  useEffect(() => {
    checkScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    checkOpacity.value = withTiming(1, { duration: 600 });
    contentOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    contentTranslateY.value = withDelay(400, withSpring(0, { damping: 15 }));

    // Navigate back to shop after 3 seconds
    const timer = setTimeout(() => {
      router.replace("/");
    }, 3500);

    return () => clearTimeout(timer);
  }, [checkScale, checkOpacity, contentOpacity, contentTranslateY, router]);

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={COLORS.gradients.primary as [string, string, string]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          {/* Success Icon */}
          <Animated.View style={[styles.iconContainer, checkAnimatedStyle]}>
            <View style={styles.iconCircle}>
              <Ionicons
                name="checkmark-circle"
                size={120}
                color={COLORS.success}
              />
            </View>
          </Animated.View>

          {/* Success Message */}
          <Animated.View style={[styles.textContainer, contentAnimatedStyle]}>
            <ThemedText style={styles.title}>Payment Successful!</ThemedText>
            <ThemedText style={styles.subtitle}>
              Your order has been placed successfully
            </ThemedText>

            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>Order ID:</ThemedText>
                <ThemedText style={styles.detailValue}>#SF2026-0001</ThemedText>
              </View>

              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>Amount:</ThemedText>
                <ThemedText style={styles.detailValue}>$328.96</ThemedText>
              </View>

              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>Delivery:</ThemedText>
                <ThemedText style={styles.detailValue}>
                  3-5 Business Days
                </ThemedText>
              </View>
            </View>

            <ThemedText style={styles.thankYou}>
              Thank you for shopping with ShoFit! 🎉
            </ThemedText>
          </Animated.View>
        </View>
      </LinearGradient>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.xl,
  },
  iconContainer: {
    marginBottom: SPACING.xl,
  },
  iconCircle: {
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: "700",
    color: "#fff",
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    color: "rgba(255,255,255,0.9)",
    marginBottom: SPACING.xl,
    textAlign: "center",
  },
  detailsContainer: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: SPACING.sm,
  },
  detailLabel: {
    fontSize: FONT_SIZES.md,
    color: "rgba(255,255,255,0.8)",
  },
  detailValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
    color: "#fff",
  },
  thankYou: {
    fontSize: FONT_SIZES.lg,
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
});

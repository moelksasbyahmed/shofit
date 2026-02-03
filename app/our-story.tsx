import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from "@/constants/design";

export default function OurStoryScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Our Story</ThemedText>
        <View style={styles.headerButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=500&fit=crop",
            }}
            style={styles.heroImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <ThemedText style={styles.heroSubtitle}>SINCE 2026</ThemedText>
              <ThemedText style={styles.heroTitle}>
                Redefining Fashion with AI
              </ThemedText>
            </View>
          </LinearGradient>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Animated.View entering={FadeInDown.delay(200)}>
            <ThemedText style={styles.sectionTitle}>Our Mission</ThemedText>
            <ThemedText style={styles.paragraph}>
              At ShoFit, we believe that finding the perfect fit shouldn&apos;t
              be a game of chance. Our mission is to revolutionize online
              shopping by combining cutting-edge AI technology with timeless
              fashion.
            </ThemedText>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300)}>
            <ThemedText style={styles.sectionTitle}>The Story</ThemedText>
            <ThemedText style={styles.paragraph}>
              Founded in 2026, ShoFit was born from a simple frustration: too
              many returns, too many sizing mistakes. We knew there had to be a
              better way. By leveraging advanced AI and computer vision, we
              created a platform that doesn&apos;t just show you clothes—it
              shows you how they&apos;ll look on you.
            </ThemedText>
            <ThemedText style={styles.paragraph}>
              Our virtual fitting room uses state-of-the-art technology to
              analyze your body measurements from photos, match them with size
              charts, and even generate realistic try-on previews. No more
              guessing, no more returns.
            </ThemedText>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400)}>
            <ThemedText style={styles.sectionTitle}>Our Values</ThemedText>

            <View style={styles.valueCard}>
              <View style={styles.valueIcon}>
                <Ionicons name="sparkles" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.valueContent}>
                <ThemedText style={styles.valueTitle}>Innovation</ThemedText>
                <ThemedText style={styles.valueText}>
                  We constantly push the boundaries of what&apos;s possible in
                  fashion tech.
                </ThemedText>
              </View>
            </View>

            <View style={styles.valueCard}>
              <View style={styles.valueIcon}>
                <Ionicons name="leaf" size={24} color={COLORS.success} />
              </View>
              <View style={styles.valueContent}>
                <ThemedText style={styles.valueTitle}>
                  Sustainability
                </ThemedText>
                <ThemedText style={styles.valueText}>
                  By reducing returns, we help minimize fashion&apos;s
                  environmental impact.
                </ThemedText>
              </View>
            </View>

            <View style={styles.valueCard}>
              <View style={styles.valueIcon}>
                <Ionicons name="people" size={24} color={COLORS.secondary} />
              </View>
              <View style={styles.valueContent}>
                <ThemedText style={styles.valueTitle}>Inclusivity</ThemedText>
                <ThemedText style={styles.valueText}>
                  Fashion for everyone, every body, every style.
                </ThemedText>
              </View>
            </View>

            <View style={styles.valueCard}>
              <View style={styles.valueIcon}>
                <Ionicons
                  name="shield-checkmark"
                  size={24}
                  color={COLORS.info}
                />
              </View>
              <View style={styles.valueContent}>
                <ThemedText style={styles.valueTitle}>Trust</ThemedText>
                <ThemedText style={styles.valueText}>
                  Your data is yours. We&apos;re transparent about how we use
                  AI.
                </ThemedText>
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(500)}>
            <ThemedText style={styles.sectionTitle}>
              Join Our Journey
            </ThemedText>
            <ThemedText style={styles.paragraph}>
              We&apos;re just getting started. Every day, we&apos;re working to
              make online shopping more personal, more accurate, and more
              enjoyable. Join thousands of happy customers who&apos;ve found
              their perfect fit with ShoFit.
            </ThemedText>

            <TouchableOpacity style={styles.ctaButton}>
              <LinearGradient
                colors={COLORS.gradients.primary as [string, string, string]}
                style={styles.ctaGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <ThemedText style={styles.ctaText}>Start Shopping</ThemedText>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xl + 10,
    paddingBottom: SPACING.md,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
  },
  heroContainer: {
    height: 300,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },
  heroContent: {
    padding: SPACING.xl,
  },
  heroSubtitle: {
    color: "#fff",
    fontSize: FONT_SIZES.sm,
    letterSpacing: 2,
    marginBottom: SPACING.xs,
  },
  heroTitle: {
    color: "#fff",
    fontSize: FONT_SIZES.xxxl,
    fontWeight: "700",
    lineHeight: 40,
  },
  content: {
    padding: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: "700",
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
  },
  paragraph: {
    fontSize: FONT_SIZES.md,
    lineHeight: 24,
    color: COLORS.gray[700],
    marginBottom: SPACING.md,
  },
  valueCard: {
    flexDirection: "row",
    padding: SPACING.md,
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  valueIcon: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  valueContent: {
    flex: 1,
  },
  valueTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
    marginBottom: SPACING.xs,
  },
  valueText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
    lineHeight: 20,
  },
  ctaButton: {
    marginTop: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    overflow: "hidden",
  },
  ctaGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  ctaText: {
    color: "#fff",
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
  },
});

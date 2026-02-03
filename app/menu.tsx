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
import Animated, { FadeInLeft } from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from "@/constants/design";

interface MenuItem {
  id: string;
  title: string;
  icon: string;
  route?: string;
  badge?: number;
}

const MENU_SECTIONS = {
  shop: [
    {
      id: "1",
      title: "New Arrivals",
      icon: "flash",
      route: "/collections/new",
    },
    { id: "2", title: "Collections", icon: "grid", route: "/collections" },
    { id: "3", title: "Dresses", icon: "shirt", route: "/category/dresses" },
    {
      id: "4",
      title: "Tops & Shirts",
      icon: "square",
      route: "/category/tops",
    },
    {
      id: "5",
      title: "Bottoms",
      icon: "square-outline",
      route: "/category/bottoms",
    },
    {
      id: "6",
      title: "Accessories",
      icon: "watch",
      route: "/category/accessories",
    },
  ],
  account: [
    {
      id: "7",
      title: "My Orders",
      icon: "receipt",
      route: "/orders",
      badge: 3,
    },
    {
      id: "8",
      title: "Wishlist",
      icon: "heart",
      route: "/wishlist",
      badge: 12,
    },
    { id: "9", title: "Addresses", icon: "location", route: "/addresses" },
    {
      id: "10",
      title: "Payment Methods",
      icon: "card",
      route: "/payment-methods",
    },
    { id: "11", title: "Settings", icon: "settings", route: "/settings" },
  ],
  info: [
    {
      id: "12",
      title: "Our Story",
      icon: "information-circle",
      route: "/our-story",
    },
    { id: "13", title: "Blog", icon: "newspaper", route: "/blog" },
    { id: "14", title: "Contact Us", icon: "mail", route: "/contact" },
    { id: "15", title: "Help & FAQ", icon: "help-circle", route: "/help" },
  ],
};

export default function MenuScreen() {
  const router = useRouter();

  const renderMenuItem = (item: MenuItem, index: number) => (
    <Animated.View key={item.id} entering={FadeInLeft.delay(index * 50)}>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => item.route && router.push(item.route as any)}
      >
        <View style={styles.menuItemLeft}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={item.icon as any}
              size={24}
              color={COLORS.primary}
            />
          </View>
          <ThemedText style={styles.menuItemText}>{item.title}</ThemedText>
        </View>
        <View style={styles.menuItemRight}>
          {item.badge && (
            <View style={styles.badge}>
              <ThemedText style={styles.badgeText}>{item.badge}</ThemedText>
            </View>
          )}
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={28} color="#000" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Menu</ThemedText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <LinearGradient
          colors={COLORS.gradients.primary as [string, string, string]}
          style={styles.profileSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Image
            source={{ uri: "https://i.pravatar.cc/150?img=12" }}
            style={styles.avatar}
            contentFit="cover"
          />
          <ThemedText style={styles.profileName}>John Doe</ThemedText>
          <ThemedText style={styles.profileEmail}>
            john.doe@example.com
          </ThemedText>
          <TouchableOpacity style={styles.profileButton}>
            <ThemedText style={styles.profileButtonText}>
              View Profile
            </ThemedText>
          </TouchableOpacity>
        </LinearGradient>

        {/* Shop Section */}
        <View style={styles.menuSection}>
          <ThemedText style={styles.sectionTitle}>SHOP</ThemedText>
          {MENU_SECTIONS.shop.map((item, index) => renderMenuItem(item, index))}
        </View>

        {/* Account Section */}
        <View style={styles.menuSection}>
          <ThemedText style={styles.sectionTitle}>ACCOUNT</ThemedText>
          {MENU_SECTIONS.account.map((item, index) =>
            renderMenuItem(item, MENU_SECTIONS.shop.length + index),
          )}
        </View>

        {/* Info Section */}
        <View style={styles.menuSection}>
          <ThemedText style={styles.sectionTitle}>INFORMATION</ThemedText>
          {MENU_SECTIONS.info.map((item, index) =>
            renderMenuItem(
              item,
              MENU_SECTIONS.shop.length + MENU_SECTIONS.account.length + index,
            ),
          )}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
          <ThemedText style={styles.logoutText}>Logout</ThemedText>
        </TouchableOpacity>

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
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "700",
  },
  profileSection: {
    alignItems: "center",
    padding: SPACING.xl,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 3,
    borderColor: "#fff",
    marginBottom: SPACING.md,
  },
  profileName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "700",
    color: "#fff",
    marginBottom: SPACING.xs,
  },
  profileEmail: {
    fontSize: FONT_SIZES.sm,
    color: "rgba(255,255,255,0.8)",
    marginBottom: SPACING.md,
  },
  profileButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
  profileButtonText: {
    color: "#fff",
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
  },
  menuSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "700",
    color: COLORS.gray[500],
    letterSpacing: 1.5,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  menuItemText: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  badge: {
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.full,
    minWidth: 24,
    height: 24,
    paddingHorizontal: SPACING.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: FONT_SIZES.xs,
    fontWeight: "700",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    marginHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.error,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.lg,
  },
  logoutText: {
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
    color: COLORS.error,
  },
});

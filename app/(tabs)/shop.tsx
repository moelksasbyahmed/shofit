import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Dimensions,
    FlatList,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from "@/constants/design";
import { useCart } from "@/contexts/CartContext";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - SPACING.md * 3) / 2;

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  isNew?: boolean;
  discount?: number;
}

interface Category {
  id: string;
  name: string;
  image: string;
}

const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Cotton Linen Shirt",
    price: 89.99,
    image:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop",
    category: "Shirts",
    isNew: true,
  },
  {
    id: "2",
    name: "Classic Denim Jacket",
    price: 129.99,
    image:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop",
    category: "Jackets",
    discount: 20,
  },
  {
    id: "3",
    name: "Summer Floral Dress",
    price: 79.99,
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop",
    category: "Dresses",
    isNew: true,
  },
  {
    id: "4",
    name: "Slim Fit Chinos",
    price: 69.99,
    image:
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=500&fit=crop",
    category: "Pants",
  },
  {
    id: "5",
    name: "Wool Blend Coat",
    price: 199.99,
    image:
      "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&h=500&fit=crop",
    category: "Coats",
  },
  {
    id: "6",
    name: "Casual Sneakers",
    price: 89.99,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop",
    category: "Shoes",
    discount: 15,
  },
];

const CATEGORIES: Category[] = [
  {
    id: "1",
    name: "New Arrivals",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=300&fit=crop",
  },
  {
    id: "2",
    name: "Dresses",
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=300&fit=crop",
  },
  {
    id: "3",
    name: "Tops & Shirts",
    image:
      "https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=400&h=300&fit=crop",
  },
  {
    id: "4",
    name: "Accessories",
    image:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=300&fit=crop",
  },
];

export default function ShopScreen() {
  const router = useRouter();
  const { getCartCount } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProducts = selectedCategory
    ? MOCK_PRODUCTS.filter((p) => p.category === selectedCategory)
    : MOCK_PRODUCTS;

  const renderProduct = ({ item, index }: { item: Product; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 100)}>
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => router.push(`/product/${item.id}` as any)}
      >
        <View style={styles.productImageContainer}>
          <Image
            source={{ uri: item.image }}
            style={styles.productImage}
            contentFit="cover"
          />
          {item.isNew && (
            <View style={styles.badge}>
              <ThemedText style={styles.badgeText}>NEW</ThemedText>
            </View>
          )}
          {item.discount && (
            <View style={[styles.badge, styles.discountBadge]}>
              <ThemedText style={styles.badgeText}>
                -{item.discount}%
              </ThemedText>
            </View>
          )}
        </View>
        <View style={styles.productInfo}>
          <ThemedText style={styles.productName} numberOfLines={2}>
            {item.name}
          </ThemedText>
          <ThemedText style={styles.productCategory}>
            {item.category}
          </ThemedText>
          <View style={styles.priceContainer}>
            {item.discount ? (
              <>
                <ThemedText style={styles.discountPrice}>
                  ${(item.price * (1 - item.discount / 100)).toFixed(2)}
                </ThemedText>
                <ThemedText style={styles.originalPrice}>
                  ${item.price.toFixed(2)}
                </ThemedText>
              </>
            ) : (
              <ThemedText style={styles.productPrice}>
                ${item.price.toFixed(2)}
              </ThemedText>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() =>
        setSelectedCategory(item.name === selectedCategory ? null : item.name)
      }
    >
      <Image
        source={{ uri: item.image }}
        style={styles.categoryImage}
        contentFit="cover"
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.7)"]}
        style={styles.categoryGradient}
      />
      <ThemedText style={styles.categoryName}>{item.name}</ThemedText>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push("/menu" as any)}>
            <Ionicons name="menu" size={28} color="#000" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>SHOFIT</ThemedText>
          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.push("/search" as any)}
            >
              <Ionicons name="search-outline" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.push("/cart" as any)}
            >
              <Ionicons name="cart-outline" size={24} color="#000" />
              {getCartCount() > 0 && (
                <View style={styles.cartBadge}>
                  <ThemedText style={styles.cartBadgeText}>
                    {getCartCount()}
                  </ThemedText>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=400&fit=crop",
            }}
            style={styles.heroImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.4)"]}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <ThemedText style={styles.heroSubtitle}>
                SPRING COLLECTION
              </ThemedText>
              <ThemedText style={styles.heroTitle}>New Arrivals</ThemedText>
              <TouchableOpacity style={styles.heroButton}>
                <ThemedText style={styles.heroButtonText}>SHOP NOW</ThemedText>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>
              Shop by Category
            </ThemedText>
          </View>
          <FlatList
            horizontal
            data={CATEGORIES}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          />
        </View>

        {/* Featured Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>
              Featured Products
            </ThemedText>
            <TouchableOpacity>
              <ThemedText style={styles.sectionLink}>View All</ThemedText>
            </TouchableOpacity>
          </View>
          <FlatList
            data={filteredProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.productRow}
          />
        </View>
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
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "700",
    letterSpacing: 3,
  },
  headerIcons: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  iconButton: {
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.full,
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  heroBanner: {
    height: 300,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    overflow: "hidden",
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
    padding: SPACING.lg,
  },
  heroSubtitle: {
    color: "#fff",
    fontSize: FONT_SIZES.sm,
    letterSpacing: 2,
    marginBottom: SPACING.xs,
  },
  heroTitle: {
    color: "#fff",
    fontSize: FONT_SIZES.xxl,
    fontWeight: "700",
    marginBottom: SPACING.md,
  },
  heroButton: {
    backgroundColor: "#fff",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: "flex-start",
  },
  heroButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
  },
  sectionLink: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
  },
  categoriesContainer: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  categoryCard: {
    width: 160,
    height: 120,
    borderRadius: BORDER_RADIUS.md,
    overflow: "hidden",
    marginRight: SPACING.sm,
  },
  categoryImage: {
    width: "100%",
    height: "100%",
  },
  categoryGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  categoryName: {
    position: "absolute",
    bottom: SPACING.sm,
    left: SPACING.sm,
    color: "#fff",
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
  },
  productRow: {
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  productCard: {
    width: CARD_WIDTH,
    marginBottom: SPACING.md,
  },
  productImageContainer: {
    width: "100%",
    height: CARD_WIDTH * 1.4,
    borderRadius: BORDER_RADIUS.md,
    overflow: "hidden",
    marginBottom: SPACING.sm,
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  badge: {
    position: "absolute",
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  discountBadge: {
    backgroundColor: COLORS.error,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  productInfo: {
    gap: 4,
  },
  productName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
  },
  productCategory: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[500],
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  productPrice: {
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
  },
  discountPrice: {
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
    color: COLORS.error,
  },
  originalPrice: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[400],
    textDecorationLine: "line-through",
  },
});

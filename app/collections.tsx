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

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - SPACING.md * 3) / 2;

interface Collection {
  id: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

const COLLECTIONS: Collection[] = [
  {
    id: "1",
    name: "Spring Collection",
    description: "Fresh and vibrant pieces for the new season",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=600&fit=crop",
    productCount: 24,
  },
  {
    id: "2",
    name: "Summer Essentials",
    description: "Lightweight and breezy styles",
    image:
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&h=600&fit=crop",
    productCount: 32,
  },
  {
    id: "3",
    name: "Casual Comfort",
    description: "Everyday wear that feels like home",
    image:
      "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=800&h=600&fit=crop",
    productCount: 18,
  },
  {
    id: "4",
    name: "Office Ready",
    description: "Professional and polished looks",
    image:
      "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=800&h=600&fit=crop",
    productCount: 28,
  },
];

const FEATURED_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Floral Summer Dress",
    price: 89.99,
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop",
  },
  {
    id: "2",
    name: "Linen Shirt",
    price: 69.99,
    image:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop",
  },
  {
    id: "3",
    name: "Wide Leg Pants",
    price: 79.99,
    image:
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=500&fit=crop",
  },
  {
    id: "4",
    name: "Casual Blazer",
    price: 129.99,
    image:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=500&fit=crop",
  },
];

export default function CollectionsScreen() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const renderCollection = ({ item }: { item: Collection }) => (
    <TouchableOpacity style={styles.collectionCard}>
      <Image
        source={{ uri: item.image }}
        style={styles.collectionImage}
        contentFit="cover"
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        style={styles.collectionGradient}
      >
        <View style={styles.collectionInfo}>
          <ThemedText style={styles.collectionName}>{item.name}</ThemedText>
          <ThemedText style={styles.collectionDescription}>
            {item.description}
          </ThemedText>
          <View style={styles.productCountBadge}>
            <ThemedText style={styles.productCountText}>
              {item.productCount} Products
            </ThemedText>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderProduct = ({ item, index }: { item: Product; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 100)}>
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => router.push(`/product/${item.id}` as any)}
      >
        <Image
          source={{ uri: item.image }}
          style={styles.productImage}
          contentFit="cover"
        />
        <View style={styles.productInfo}>
          <ThemedText style={styles.productName} numberOfLines={2}>
            {item.name}
          </ThemedText>
          <ThemedText style={styles.productPrice}>
            ${item.price.toFixed(2)}
          </ThemedText>
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
          style={styles.headerButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Collections</ThemedText>
        <TouchableOpacity
          onPress={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          style={styles.headerButton}
        >
          <Ionicons
            name={viewMode === "grid" ? "list" : "grid"}
            size={24}
            color="#000"
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop",
            }}
            style={styles.heroImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.6)"]}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <ThemedText style={styles.heroSubtitle}>
                CURATED FOR YOU
              </ThemedText>
              <ThemedText style={styles.heroTitle}>
                Discover Our Collections
              </ThemedText>
            </View>
          </LinearGradient>
        </View>

        {/* Collections */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>
              Featured Collections
            </ThemedText>
          </View>
          <FlatList
            data={COLLECTIONS}
            renderItem={renderCollection}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.collectionsContainer}
          />
        </View>

        {/* Products */}
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
            data={FEATURED_PRODUCTS}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.productRow}
          />
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
  heroBanner: {
    height: 200,
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
  collectionsContainer: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  collectionCard: {
    width: 280,
    height: 180,
    borderRadius: BORDER_RADIUS.md,
    overflow: "hidden",
    marginRight: SPACING.sm,
  },
  collectionImage: {
    width: "100%",
    height: "100%",
  },
  collectionGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },
  collectionInfo: {
    padding: SPACING.md,
  },
  collectionName: {
    color: "#fff",
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
    marginBottom: SPACING.xs,
  },
  collectionDescription: {
    color: "rgba(255,255,255,0.9)",
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.sm,
  },
  productCountBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  productCountText: {
    color: "#fff",
    fontSize: FONT_SIZES.xs,
    fontWeight: "600",
  },
  productRow: {
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  productCard: {
    width: CARD_WIDTH,
  },
  productImage: {
    width: "100%",
    height: CARD_WIDTH * 1.4,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  productInfo: {
    gap: 4,
  },
  productName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
  },
  productPrice: {
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
  },
});

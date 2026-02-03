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
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from "@/constants/design";

const { width } = Dimensions.get("window");

interface SearchSuggestion {
  id: string;
  text: string;
  type: "recent" | "trending";
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

const RECENT_SEARCHES: SearchSuggestion[] = [
  { id: "1", text: "Summer dresses", type: "recent" },
  { id: "2", text: "Denim jackets", type: "recent" },
  { id: "3", text: "White sneakers", type: "recent" },
];

const TRENDING_SEARCHES: SearchSuggestion[] = [
  { id: "1", text: "Oversized shirts", type: "trending" },
  { id: "2", text: "Wide leg pants", type: "trending" },
  { id: "3", text: "Bucket hats", type: "trending" },
  { id: "4", text: "Platform shoes", type: "trending" },
];

const SEARCH_RESULTS: Product[] = [
  {
    id: "1",
    name: "Cotton Linen Shirt",
    price: 89.99,
    image:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop",
    category: "Shirts",
  },
  {
    id: "2",
    name: "Summer Floral Dress",
    price: 79.99,
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop",
    category: "Dresses",
  },
  {
    id: "3",
    name: "Slim Fit Chinos",
    price: 69.99,
    image:
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=500&fit=crop",
    category: "Pants",
  },
  {
    id: "4",
    name: "Casual Sneakers",
    price: 89.99,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop",
    category: "Shoes",
  },
];

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowResults(query.length > 0);
  };

  const renderSuggestion = ({ item }: { item: SearchSuggestion }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSearch(item.text)}
    >
      <Ionicons
        name={item.type === "recent" ? "time-outline" : "trending-up-outline"}
        size={20}
        color={COLORS.gray[500]}
      />
      <ThemedText style={styles.suggestionText}>{item.text}</ThemedText>
      <Ionicons
        name="arrow-forward-outline"
        size={16}
        color={COLORS.gray[400]}
      />
    </TouchableOpacity>
  );

  const renderProduct = ({ item, index }: { item: Product; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100)}
      style={styles.productCard}
    >
      <TouchableOpacity
        style={styles.productContent}
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
          <ThemedText style={styles.productCategory}>
            {item.category}
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
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={COLORS.gray[500]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for products..."
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={COLORS.gray[400]}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {!showResults ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Recent Searches */}
          {RECENT_SEARCHES.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ThemedText style={styles.sectionTitle}>
                  Recent Searches
                </ThemedText>
                <TouchableOpacity>
                  <ThemedText style={styles.clearText}>Clear All</ThemedText>
                </TouchableOpacity>
              </View>
              <FlatList
                data={RECENT_SEARCHES}
                renderItem={renderSuggestion}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </View>
          )}

          {/* Trending Searches */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>
                Trending Searches
              </ThemedText>
            </View>
            <View style={styles.trendingContainer}>
              {TRENDING_SEARCHES.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.trendingTag}
                  onPress={() => handleSearch(item.text)}
                >
                  <Ionicons
                    name="trending-up"
                    size={16}
                    color={COLORS.primary}
                  />
                  <ThemedText style={styles.trendingText}>
                    {item.text}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Popular Categories */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>
                Popular Categories
              </ThemedText>
            </View>
            <View style={styles.categoriesGrid}>
              {[
                "Dresses",
                "Tops",
                "Pants",
                "Shoes",
                "Accessories",
                "Jackets",
              ].map((category) => (
                <TouchableOpacity
                  key={category}
                  style={styles.categoryCard}
                  onPress={() => handleSearch(category)}
                >
                  <LinearGradient
                    colors={
                      COLORS.gradients.primary as [string, string, string]
                    }
                    style={styles.categoryGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <ThemedText style={styles.categoryText}>
                      {category}
                    </ThemedText>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.resultsContainer}>
          <View style={styles.resultsHeader}>
            <ThemedText style={styles.resultsTitle}>
              Search Results for &quot;{searchQuery}&quot;
            </ThemedText>
            <ThemedText style={styles.resultsCount}>
              {SEARCH_RESULTS.length} products found
            </ThemedText>
          </View>
          <FlatList
            data={SEARCH_RESULTS}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
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
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xl + 10,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.md,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.md,
  },
  section: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
  },
  clearText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  suggestionText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
  },
  trendingContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  trendingTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: `${COLORS.primary}15`,
    borderRadius: BORDER_RADIUS.full,
  },
  trendingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: "600",
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  categoryCard: {
    width: (width - SPACING.md * 2 - SPACING.sm * 2) / 3,
    borderRadius: BORDER_RADIUS.md,
    overflow: "hidden",
  },
  categoryGradient: {
    paddingVertical: SPACING.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryText: {
    color: "#fff",
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  resultsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
    marginBottom: SPACING.xs,
  },
  resultsCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
  },
  productCard: {
    flexDirection: "row",
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  productContent: {
    flex: 1,
    flexDirection: "row",
    gap: SPACING.md,
  },
  productImage: {
    width: 100,
    height: 120,
    borderRadius: BORDER_RADIUS.sm,
  },
  productInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  productName: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
  },
  productCategory: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
  },
  productPrice: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
    color: COLORS.primary,
  },
});

import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
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

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: "1",
    title: "Spring Fashion Trends 2026",
    excerpt:
      "Discover the hottest fashion trends for this spring season, from bold colors to sustainable fabrics.",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=600&fit=crop",
    author: "Emma Wilson",
    date: "Feb 1, 2026",
    category: "Trends",
    readTime: "5 min",
  },
  {
    id: "2",
    title: "How to Build a Capsule Wardrobe",
    excerpt:
      "Learn the art of creating a versatile wardrobe with fewer pieces that work perfectly together.",
    image:
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&h=600&fit=crop",
    author: "Sarah Chen",
    date: "Jan 28, 2026",
    category: "Style Guide",
    readTime: "8 min",
  },
  {
    id: "3",
    title: "Sustainable Fashion: What You Need to Know",
    excerpt:
      "Everything you need to know about making eco-friendly fashion choices in 2026.",
    image:
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&h=600&fit=crop",
    author: "Michael Green",
    date: "Jan 25, 2026",
    category: "Sustainability",
    readTime: "6 min",
  },
  {
    id: "4",
    title: "The Perfect Fit: Sizing Guide",
    excerpt:
      "Tips and tricks for finding clothes that fit perfectly every time you shop online.",
    image:
      "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=800&h=600&fit=crop",
    author: "Lisa Anderson",
    date: "Jan 22, 2026",
    category: "Tips & Tricks",
    readTime: "4 min",
  },
];

const CATEGORIES = [
  "All",
  "Trends",
  "Style Guide",
  "Sustainability",
  "Tips & Tricks",
];

export default function BlogScreen() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredPosts =
    selectedCategory === "All"
      ? BLOG_POSTS
      : BLOG_POSTS.filter((post) => post.category === selectedCategory);

  const renderGridPost = ({
    item,
    index,
  }: {
    item: BlogPost;
    index: number;
  }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100)}
      style={styles.gridCard}
    >
      <TouchableOpacity onPress={() => router.back()}>
        <Image
          source={{ uri: item.image }}
          style={styles.gridImage}
          contentFit="cover"
        />
        <View style={styles.gridContent}>
          <View style={styles.categoryBadge}>
            <ThemedText style={styles.categoryBadgeText}>
              {item.category}
            </ThemedText>
          </View>
          <ThemedText style={styles.gridTitle} numberOfLines={2}>
            {item.title}
          </ThemedText>
          <ThemedText style={styles.gridExcerpt} numberOfLines={2}>
            {item.excerpt}
          </ThemedText>
          <View style={styles.gridMeta}>
            <ThemedText style={styles.metaText}>{item.author}</ThemedText>
            <ThemedText style={styles.metaText}>•</ThemedText>
            <ThemedText style={styles.metaText}>{item.readTime}</ThemedText>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderListPost = ({
    item,
    index,
  }: {
    item: BlogPost;
    index: number;
  }) => (
    <Animated.View entering={FadeInDown.delay(index * 100)}>
      <TouchableOpacity style={styles.listCard} onPress={() => router.back()}>
        <Image
          source={{ uri: item.image }}
          style={styles.listImage}
          contentFit="cover"
        />
        <View style={styles.listContent}>
          <View style={styles.categoryBadge}>
            <ThemedText style={styles.categoryBadgeText}>
              {item.category}
            </ThemedText>
          </View>
          <ThemedText style={styles.listTitle} numberOfLines={2}>
            {item.title}
          </ThemedText>
          <ThemedText style={styles.listExcerpt} numberOfLines={2}>
            {item.excerpt}
          </ThemedText>
          <View style={styles.listMeta}>
            <ThemedText style={styles.metaText}>{item.author}</ThemedText>
            <ThemedText style={styles.metaText}>•</ThemedText>
            <ThemedText style={styles.metaText}>{item.date}</ThemedText>
            <ThemedText style={styles.metaText}>•</ThemedText>
            <ThemedText style={styles.metaText}>
              {item.readTime} read
            </ThemedText>
          </View>
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
        <ThemedText style={styles.headerTitle}>Blog</ThemedText>
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

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <ThemedText
              style={[
                styles.categoryButtonText,
                selectedCategory === category &&
                  styles.categoryButtonTextActive,
              ]}
            >
              {category}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Posts */}
      {viewMode === "grid" ? (
        <FlatList
          data={filteredPosts}
          renderItem={renderGridPost}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.gridRow}
        />
      ) : (
        <FlatList
          data={filteredPosts}
          renderItem={renderListPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
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
  categoryScroll: {
    maxHeight: 50,
  },
  categoryContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  categoryButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray[100],
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
  },
  categoryButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
    color: COLORS.gray[700],
  },
  categoryButtonTextActive: {
    color: "#fff",
  },
  gridContainer: {
    padding: SPACING.md,
  },
  gridRow: {
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  gridCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: BORDER_RADIUS.md,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gridImage: {
    width: "100%",
    height: 140,
  },
  gridContent: {
    padding: SPACING.sm,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: `${COLORS.primary}20`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.xs,
  },
  categoryBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "600",
    color: COLORS.primary,
  },
  gridTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
    marginBottom: SPACING.xs,
  },
  gridExcerpt: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
    marginBottom: SPACING.xs,
  },
  gridMeta: {
    flexDirection: "row",
    gap: SPACING.xs,
  },
  metaText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[500],
  },
  listContainer: {
    padding: SPACING.md,
  },
  listCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: BORDER_RADIUS.md,
    overflow: "hidden",
    marginBottom: SPACING.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listImage: {
    width: 120,
    height: 140,
  },
  listContent: {
    flex: 1,
    padding: SPACING.sm,
    justifyContent: "space-between",
  },
  listTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
    marginBottom: SPACING.xs,
  },
  listExcerpt: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
    marginBottom: SPACING.xs,
  },
  listMeta: {
    flexDirection: "row",
    gap: SPACING.xs,
    flexWrap: "wrap",
  },
});

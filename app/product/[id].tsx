import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from "@/constants/design";
import { useCart } from "@/contexts/CartContext";
import { useMeasurements } from "@/contexts/MeasurementsContext";

const { width } = Dimensions.get("window");

const PRODUCT_IMAGES = [
  "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=1000&fit=crop",
  "https://images.unsplash.com/photo-1596755094629-2019c1b84149?w=800&h=1000&fit=crop",
  "https://images.unsplash.com/photo-1596755093369-786ffb9c3ff7?w=800&h=1000&fit=crop",
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const COLORS_AVAILABLE = [
  { name: "White", hex: "#FFFFFF" },
  { name: "Black", hex: "#000000" },
  { name: "Navy", hex: "#1E3A8A" },
  { name: "Gray", hex: "#6B7280" },
];

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { hasMeasurements } = useMeasurements();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState(COLORS_AVAILABLE[0]);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const product = {
    id,
    name: "Cotton Linen Shirt",
    price: 89.99,
    description:
      "Premium cotton-linen blend shirt with a relaxed fit. Perfect for casual occasions and warm weather. Features include button-down collar, chest pocket, and breathable fabric.",
    rating: 4.5,
    reviews: 128,
    inStock: true,
    brand: "SHOFIT Essentials",
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      Alert.alert("Select Size", "Please select a size before adding to cart");
      return;
    }

    addToCart({
      id: id as string,
      name: product.name,
      price: product.price,
      image: PRODUCT_IMAGES[0],
      size: selectedSize,
      color: selectedColor.name,
      quantity: quantity,
    });

    Alert.alert(
      "Added to Cart",
      `${product.name} has been added to your cart.`,
      [
        { text: "Continue Shopping", style: "cancel" },
        { text: "View Cart", onPress: () => router.push("/cart" as any) },
      ],
    );
  };

  const handleTryWithAI = () => {
    if (!hasMeasurements()) {
      Alert.alert(
        "Measurements Required",
        "Please add your body measurements first to use AI virtual fitting.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Add Measurements",
            onPress: () => router.push("/(tabs)/measurements" as any),
          },
        ],
      );
      return;
    }

    router.push("/(tabs)" as any);
  };

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
        <ThemedText style={styles.headerTitle}>Product Detail</ThemedText>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="share-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <Animated.View entering={FadeInUp} style={styles.imageGallery}>
          <Image
            source={{ uri: PRODUCT_IMAGES[selectedImage] }}
            style={styles.mainImage}
            contentFit="cover"
          />
          <TouchableOpacity
            onPress={() => setIsFavorite(!isFavorite)}
            style={styles.favoriteButton}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={28}
              color={isFavorite ? COLORS.error : "#000"}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Thumbnail Images */}
        <View style={styles.thumbnailContainer}>
          {PRODUCT_IMAGES.map((img, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedImage(index)}
              style={[
                styles.thumbnail,
                selectedImage === index && styles.thumbnailActive,
              ]}
            >
              <Image
                source={{ uri: img }}
                style={styles.thumbnailImage}
                contentFit="cover"
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Product Info */}
        <Animated.View
          entering={FadeInDown.delay(200)}
          style={styles.productInfo}
        >
          <View style={styles.brandRow}>
            <ThemedText style={styles.brand}>{product.brand}</ThemedText>
            <View style={styles.rating}>
              <Ionicons name="star" size={16} color="#FFA500" />
              <ThemedText style={styles.ratingText}>
                {product.rating} ({product.reviews})
              </ThemedText>
            </View>
          </View>

          <ThemedText style={styles.productName}>{product.name}</ThemedText>
          <ThemedText style={styles.price}>
            ${product.price.toFixed(2)}
          </ThemedText>

          <View style={styles.stockBadge}>
            <View
              style={[
                styles.stockIndicator,
                {
                  backgroundColor: product.inStock
                    ? COLORS.success
                    : COLORS.error,
                },
              ]}
            />
            <ThemedText style={styles.stockText}>
              {product.inStock ? "In Stock" : "Out of Stock"}
            </ThemedText>
          </View>

          <ThemedText style={styles.description}>
            {product.description}
          </ThemedText>

          {/* AI Try-On CTA */}
          <TouchableOpacity
            onPress={handleTryWithAI}
            style={styles.aiTryOnButton}
          >
            <LinearGradient
              colors={COLORS.gradients.primary as [string, string, string]}
              style={styles.aiTryOnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="camera" size={24} color="#fff" />
              <ThemedText style={styles.aiTryOnText}>
                Try with AI Virtual Fitting
              </ThemedText>
              <Ionicons name="chevron-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Size Selection */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Select Size</ThemedText>
            <View style={styles.sizeContainer}>
              {SIZES.map((size) => (
                <TouchableOpacity
                  key={size}
                  onPress={() => setSelectedSize(size)}
                  style={[
                    styles.sizeButton,
                    selectedSize === size && styles.sizeButtonActive,
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.sizeText,
                      selectedSize === size && styles.sizeTextActive,
                    ]}
                  >
                    {size}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity>
              <ThemedText style={styles.sizeGuide}>Size Guide</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Color Selection */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              Color: {selectedColor.name}
            </ThemedText>
            <View style={styles.colorContainer}>
              {COLORS_AVAILABLE.map((color) => (
                <TouchableOpacity
                  key={color.name}
                  onPress={() => setSelectedColor(color)}
                  style={[
                    styles.colorButton,
                    selectedColor.name === color.name &&
                      styles.colorButtonActive,
                  ]}
                >
                  <View
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: color.hex },
                      color.hex === "#FFFFFF" && styles.colorSwatchBorder,
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Quantity */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Quantity</ThemedText>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                style={styles.quantityButton}
              >
                <Ionicons name="remove" size={20} color="#000" />
              </TouchableOpacity>
              <ThemedText style={styles.quantityText}>{quantity}</ThemedText>
              <TouchableOpacity
                onPress={() => setQuantity(quantity + 1)}
                style={styles.quantityButton}
              >
                <Ionicons name="add" size={20} color="#000" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Product Details */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Product Details</ThemedText>
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Material</ThemedText>
              <ThemedText style={styles.detailValue}>
                70% Cotton, 30% Linen
              </ThemedText>
            </View>
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Care</ThemedText>
              <ThemedText style={styles.detailValue}>
                Machine Wash Cold
              </ThemedText>
            </View>
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Origin</ThemedText>
              <ThemedText style={styles.detailValue}>
                Made in Portugal
              </ThemedText>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceSection}>
          <ThemedText style={styles.totalLabel}>Total Price</ThemedText>
          <ThemedText style={styles.totalPrice}>
            ${(product.price * quantity).toFixed(2)}
          </ThemedText>
        </View>
        <TouchableOpacity
          onPress={handleAddToCart}
          style={styles.addToCartButton}
        >
          <LinearGradient
            colors={COLORS.gradients.primary as [string, string, string]}
            style={styles.addToCartGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="cart" size={24} color="#fff" />
            <ThemedText style={styles.addToCartText}>Add to Cart</ThemedText>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
  imageGallery: {
    width: width,
    height: width * 1.2,
    position: "relative",
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  favoriteButton: {
    position: "absolute",
    top: SPACING.md,
    right: SPACING.md,
    width: 50,
    height: 50,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: BORDER_RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbnailContainer: {
    flexDirection: "row",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.sm,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  thumbnailActive: {
    borderColor: COLORS.primary,
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  productInfo: {
    padding: SPACING.md,
  },
  brandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  brand: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
  },
  productName: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: "700",
    marginBottom: SPACING.sm,
  },
  price: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  stockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  stockIndicator: {
    width: 8,
    height: 8,
    borderRadius: BORDER_RADIUS.full,
  },
  stockText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
    lineHeight: 24,
    marginBottom: SPACING.lg,
  },
  aiTryOnButton: {
    marginBottom: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    overflow: "hidden",
  },
  aiTryOnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  aiTryOnText: {
    color: "#fff",
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
    marginBottom: SPACING.sm,
  },
  sizeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  sizeButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    minWidth: 60,
    alignItems: "center",
  },
  sizeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sizeText: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
  },
  sizeTextActive: {
    color: "#fff",
  },
  sizeGuide: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    textDecorationLine: "underline",
  },
  colorContainer: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  colorButton: {
    padding: 4,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorButtonActive: {
    borderColor: COLORS.primary,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.sm,
  },
  colorSwatchBorder: {
    borderWidth: 1,
    borderColor: COLORS.gray[300],
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    alignItems: "center",
    justifyContent: "center",
  },
  quantityText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
    minWidth: 40,
    textAlign: "center",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  detailLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
  },
  detailValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
  },
  bottomBar: {
    flexDirection: "row",
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    backgroundColor: "#fff",
    gap: SPACING.md,
  },
  priceSection: {
    flex: 1,
    justifyContent: "center",
  },
  totalLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
    marginBottom: 2,
  },
  totalPrice: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "700",
    color: COLORS.primary,
  },
  addToCartButton: {
    flex: 1.5,
    borderRadius: BORDER_RADIUS.md,
    overflow: "hidden",
  },
  addToCartGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  addToCartText: {
    color: "#fff",
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
  },
});

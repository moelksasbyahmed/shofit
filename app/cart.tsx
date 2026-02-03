import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from "@/constants/design";
import { useCart } from "@/contexts/CartContext";

export default function CartScreen() {
  const router = useRouter();
  const {
    items: cartItems,
    updateQuantity,
    removeFromCart,
    getCartTotal,
  } = useCart();

  const subtotal = getCartTotal();
  const shipping = subtotal > 0 ? 10.0 : 0;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  if (cartItems.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerButton}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Shopping Cart</ThemedText>
          <View style={styles.headerButton} />
        </View>

        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={120} color={COLORS.gray[300]} />
          <ThemedText style={styles.emptyTitle}>Your Cart is Empty</ThemedText>
          <ThemedText style={styles.emptyText}>
            Looks like you haven&apos;t added anything to your cart yet
          </ThemedText>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.shopNowButton}
          >
            <LinearGradient
              colors={COLORS.gradients.primary as [string, string, string]}
              style={styles.shopNowGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <ThemedText style={styles.shopNowText}>Start Shopping</ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

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
        <ThemedText style={styles.headerTitle}>
          Shopping Cart (
          {cartItems.reduce((sum, item) => sum + item.quantity, 0)})
        </ThemedText>
        <View style={styles.headerButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cart Items */}
        <View style={styles.itemsContainer}>
          {cartItems.map((item, index) => (
            <Animated.View
              key={item.id}
              entering={FadeInDown.delay(index * 100)}
              style={styles.cartItem}
            >
              <Image
                source={{ uri: item.image }}
                style={styles.itemImage}
                contentFit="cover"
              />

              <View style={styles.itemDetails}>
                <ThemedText style={styles.itemName} numberOfLines={2}>
                  {item.name}
                </ThemedText>
                <View style={styles.itemAttributes}>
                  <ThemedText style={styles.itemAttribute}>
                    Size: {item.size}
                  </ThemedText>
                  <ThemedText style={styles.itemAttribute}>•</ThemedText>
                  <ThemedText style={styles.itemAttribute}>
                    Color: {item.color}
                  </ThemedText>
                </View>
                <ThemedText style={styles.itemPrice}>
                  ${item.price.toFixed(2)}
                </ThemedText>

                <View style={styles.itemActions}>
                  <View style={styles.quantityControl}>
                    <TouchableOpacity
                      onPress={() =>
                        updateQuantity(
                          item.id,
                          item.size,
                          item.color,
                          item.quantity - 1,
                        )
                      }
                      style={styles.quantityButton}
                    >
                      <Ionicons name="remove" size={16} color="#000" />
                    </TouchableOpacity>
                    <ThemedText style={styles.quantityText}>
                      {item.quantity}
                    </ThemedText>
                    <TouchableOpacity
                      onPress={() =>
                        updateQuantity(
                          item.id,
                          item.size,
                          item.color,
                          item.quantity + 1,
                        )
                      }
                      style={styles.quantityButton}
                    >
                      <Ionicons name="add" size={16} color="#000" />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    onPress={() =>
                      removeFromCart(item.id, item.size, item.color)
                    }
                  >
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color={COLORS.error}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* Promo Code */}
        <View style={styles.promoSection}>
          <View style={styles.promoInputContainer}>
            <Ionicons
              name="pricetag-outline"
              size={20}
              color={COLORS.gray[500]}
            />
            <ThemedText style={styles.promoInput}>Enter Promo Code</ThemedText>
          </View>
          <TouchableOpacity style={styles.applyButton}>
            <ThemedText style={styles.applyButtonText}>Apply</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Order Summary */}
        <View style={styles.summaryContainer}>
          <ThemedText style={styles.summaryTitle}>Order Summary</ThemedText>

          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>Subtotal</ThemedText>
            <ThemedText style={styles.summaryValue}>
              ${subtotal.toFixed(2)}
            </ThemedText>
          </View>

          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>Shipping</ThemedText>
            <ThemedText style={styles.summaryValue}>
              ${shipping.toFixed(2)}
            </ThemedText>
          </View>

          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>Tax (10%)</ThemedText>
            <ThemedText style={styles.summaryValue}>
              ${tax.toFixed(2)}
            </ThemedText>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <ThemedText style={styles.totalLabel}>Total</ThemedText>
            <ThemedText style={styles.totalValue}>
              ${total.toFixed(2)}
            </ThemedText>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.totalSection}>
          <ThemedText style={styles.bottomTotalLabel}>Total</ThemedText>
          <ThemedText style={styles.bottomTotalValue}>
            ${total.toFixed(2)}
          </ThemedText>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/checkout" as any)}
          style={styles.checkoutButton}
        >
          <LinearGradient
            colors={COLORS.gradients.primary as [string, string, string]}
            style={styles.checkoutGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <ThemedText style={styles.checkoutText}>
              Proceed to Checkout
            </ThemedText>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
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
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "700",
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
    textAlign: "center",
    marginBottom: SPACING.xl,
  },
  shopNowButton: {
    width: "100%",
    borderRadius: BORDER_RADIUS.md,
    overflow: "hidden",
  },
  shopNowGradient: {
    paddingVertical: SPACING.md,
    alignItems: "center",
  },
  shopNowText: {
    color: "#fff",
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
  },
  itemsContainer: {
    padding: SPACING.md,
  },
  cartItem: {
    flexDirection: "row",
    marginBottom: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.md,
  },
  itemImage: {
    width: 100,
    height: 120,
    borderRadius: BORDER_RADIUS.sm,
  },
  itemDetails: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: "space-between",
  },
  itemName: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    marginBottom: SPACING.xs,
  },
  itemAttributes: {
    flexDirection: "row",
    gap: SPACING.xs,
  },
  itemAttribute: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
  },
  itemPrice: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
    color: COLORS.primary,
  },
  itemActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    alignItems: "center",
    justifyContent: "center",
  },
  quantityText: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    minWidth: 30,
    textAlign: "center",
  },
  promoSection: {
    flexDirection: "row",
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  promoInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  promoInput: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[500],
  },
  applyButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: "center",
  },
  applyButtonText: {
    color: "#fff",
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
  },
  summaryContainer: {
    marginHorizontal: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.md,
  },
  summaryTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
    marginBottom: SPACING.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
  },
  summaryValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray[300],
    marginVertical: SPACING.sm,
  },
  totalLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
  },
  totalValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
    color: COLORS.primary,
  },
  bottomBar: {
    flexDirection: "row",
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    backgroundColor: "#fff",
    gap: SPACING.md,
  },
  totalSection: {
    flex: 1,
    justifyContent: "center",
  },
  bottomTotalLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
    marginBottom: 2,
  },
  bottomTotalValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "700",
    color: COLORS.primary,
  },
  checkoutButton: {
    flex: 1.5,
    borderRadius: BORDER_RADIUS.md,
    overflow: "hidden",
  },
  checkoutGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  checkoutText: {
    color: "#fff",
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
  },
});

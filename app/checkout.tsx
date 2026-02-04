import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from "@/constants/design";

interface PaymentMethod {
  id: string;
  type: "card" | "paypal" | "apple" | "google";
  name: string;
  icon: string;
  last4?: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "1",
    type: "card",
    name: "Credit Card",
    icon: "card-outline",
    last4: "4242",
  },
  { id: "2", type: "paypal", name: "PayPal", icon: "logo-paypal" },
  { id: "3", type: "apple", name: "Apple Pay", icon: "logo-apple" },
  { id: "4", type: "google", name: "Google Pay", icon: "logo-google" },
];

export default function CheckoutScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState(PAYMENT_METHODS[0].id);
  const [saveAddress, setSaveAddress] = useState(true);
  const [sameAsBilling, setSameAsBilling] = useState(true);

  const [shippingInfo, setShippingInfo] = useState({
    fullName: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 234 567 8900",
    address: "123 Main Street",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    country: "United States",
  });

  const subtotal = 289.97;
  const shipping = 10.0;
  const tax = 28.99;
  const total = subtotal + shipping + tax;

  const handleContinue = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      // Process payment
      router.push("/(tabs)" as any);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (step === 1 ? router.back() : setStep(1))}
          style={styles.headerButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Checkout</ThemedText>
        <View style={styles.headerButton} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressStep}>
          <View style={[styles.stepCircle, styles.stepCircleActive]}>
            <Ionicons name="location" size={16} color="#fff" />
          </View>
          <ThemedText
            style={[styles.stepLabel, step >= 1 && styles.stepLabelActive]}
          >
            Shipping
          </ThemedText>
        </View>

        <View
          style={[styles.progressLine, step >= 2 && styles.progressLineActive]}
        />

        <View style={styles.progressStep}>
          <View
            style={[styles.stepCircle, step >= 2 && styles.stepCircleActive]}
          >
            <Ionicons
              name="card"
              size={16}
              color={step >= 2 ? "#fff" : COLORS.gray[400]}
            />
          </View>
          <ThemedText
            style={[styles.stepLabel, step >= 2 && styles.stepLabelActive]}
          >
            Payment
          </ThemedText>
        </View>

        <View
          style={[styles.progressLine, step >= 3 && styles.progressLineActive]}
        />

        <View style={styles.progressStep}>
          <View
            style={[styles.stepCircle, step >= 3 && styles.stepCircleActive]}
          >
            <Ionicons
              name="checkmark"
              size={16}
              color={step >= 3 ? "#fff" : COLORS.gray[400]}
            />
          </View>
          <ThemedText
            style={[styles.stepLabel, step >= 3 && styles.stepLabelActive]}
          >
            Confirm
          </ThemedText>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {step === 1 ? (
          <Animated.View entering={FadeInDown}>
            {/* Shipping Address */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="location-outline"
                  size={24}
                  color={COLORS.primary}
                />
                <ThemedText style={styles.sectionTitle}>
                  Shipping Address
                </ThemedText>
              </View>

              <View style={styles.form}>
                <View style={styles.formRow}>
                  <View style={styles.formField}>
                    <ThemedText style={styles.formLabel}>Full Name</ThemedText>
                    <TextInput
                      style={styles.input}
                      value={shippingInfo.fullName}
                      onChangeText={(text) =>
                        setShippingInfo({ ...shippingInfo, fullName: text })
                      }
                      placeholder="Enter full name"
                    />
                  </View>
                </View>

                <View style={styles.formRow}>
                  <View style={styles.formField}>
                    <ThemedText style={styles.formLabel}>Email</ThemedText>
                    <TextInput
                      style={styles.input}
                      value={shippingInfo.email}
                      onChangeText={(text) =>
                        setShippingInfo({ ...shippingInfo, email: text })
                      }
                      placeholder="Enter email"
                      keyboardType="email-address"
                    />
                  </View>
                </View>

                <View style={styles.formRow}>
                  <View style={styles.formField}>
                    <ThemedText style={styles.formLabel}>Phone</ThemedText>
                    <TextInput
                      style={styles.input}
                      value={shippingInfo.phone}
                      onChangeText={(text) =>
                        setShippingInfo({ ...shippingInfo, phone: text })
                      }
                      placeholder="Enter phone number"
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                <View style={styles.formRow}>
                  <View style={styles.formField}>
                    <ThemedText style={styles.formLabel}>Address</ThemedText>
                    <TextInput
                      style={styles.input}
                      value={shippingInfo.address}
                      onChangeText={(text) =>
                        setShippingInfo({ ...shippingInfo, address: text })
                      }
                      placeholder="Street address"
                    />
                  </View>
                </View>

                <View style={styles.formRowDouble}>
                  <View style={[styles.formField, { flex: 1 }]}>
                    <ThemedText style={styles.formLabel}>City</ThemedText>
                    <TextInput
                      style={styles.input}
                      value={shippingInfo.city}
                      onChangeText={(text) =>
                        setShippingInfo({ ...shippingInfo, city: text })
                      }
                      placeholder="City"
                    />
                  </View>

                  <View style={[styles.formField, { flex: 1 }]}>
                    <ThemedText style={styles.formLabel}>State</ThemedText>
                    <TextInput
                      style={styles.input}
                      value={shippingInfo.state}
                      onChangeText={(text) =>
                        setShippingInfo({ ...shippingInfo, state: text })
                      }
                      placeholder="State"
                    />
                  </View>
                </View>

                <View style={styles.formRowDouble}>
                  <View style={[styles.formField, { flex: 1 }]}>
                    <ThemedText style={styles.formLabel}>ZIP Code</ThemedText>
                    <TextInput
                      style={styles.input}
                      value={shippingInfo.zipCode}
                      onChangeText={(text) =>
                        setShippingInfo({ ...shippingInfo, zipCode: text })
                      }
                      placeholder="ZIP"
                      keyboardType="number-pad"
                    />
                  </View>

                  <View style={[styles.formField, { flex: 1 }]}>
                    <ThemedText style={styles.formLabel}>Country</ThemedText>
                    <TextInput
                      style={styles.input}
                      value={shippingInfo.country}
                      onChangeText={(text) =>
                        setShippingInfo({ ...shippingInfo, country: text })
                      }
                      placeholder="Country"
                    />
                  </View>
                </View>

                <View style={styles.checkboxRow}>
                  <Switch
                    value={saveAddress}
                    onValueChange={setSaveAddress}
                    trackColor={{
                      false: COLORS.gray[300],
                      true: COLORS.primary,
                    }}
                    thumbColor="#fff"
                  />
                  <ThemedText style={styles.checkboxLabel}>
                    Save this address
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Delivery Method */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="cube-outline"
                  size={24}
                  color={COLORS.primary}
                />
                <ThemedText style={styles.sectionTitle}>
                  Delivery Method
                </ThemedText>
              </View>

              <TouchableOpacity
                style={[styles.deliveryOption, styles.deliveryOptionSelected]}
              >
                <View style={styles.radioButton}>
                  <View style={styles.radioButtonInner} />
                </View>
                <View style={styles.deliveryInfo}>
                  <ThemedText style={styles.deliveryName}>
                    Standard Delivery
                  </ThemedText>
                  <ThemedText style={styles.deliveryTime}>
                    3-5 Business Days
                  </ThemedText>
                </View>
                <ThemedText style={styles.deliveryPrice}>$10.00</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={styles.deliveryOption}>
                <View style={styles.radioButton} />
                <View style={styles.deliveryInfo}>
                  <ThemedText style={styles.deliveryName}>
                    Express Delivery
                  </ThemedText>
                  <ThemedText style={styles.deliveryTime}>
                    1-2 Business Days
                  </ThemedText>
                </View>
                <ThemedText style={styles.deliveryPrice}>$20.00</ThemedText>
              </TouchableOpacity>
            </View>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown}>
            {/* Payment Method */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="card-outline"
                  size={24}
                  color={COLORS.primary}
                />
                <ThemedText style={styles.sectionTitle}>
                  Payment Method
                </ThemedText>
              </View>

              {PAYMENT_METHODS.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  onPress={() => setSelectedPayment(method.id)}
                  style={[
                    styles.paymentOption,
                    selectedPayment === method.id &&
                      styles.paymentOptionSelected,
                  ]}
                >
                  <View style={styles.radioButton}>
                    {selectedPayment === method.id && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                  <Ionicons
                    name={method.icon as any}
                    size={24}
                    color={COLORS.gray[700]}
                  />
                  <ThemedText style={styles.paymentName}>
                    {method.name}
                  </ThemedText>
                  {method.last4 && (
                    <ThemedText style={styles.paymentLast4}>
                      ****{method.last4}
                    </ThemedText>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Card Details */}
            {selectedPayment === "1" && (
              <View style={styles.section}>
                <View style={styles.form}>
                  <View style={styles.formRow}>
                    <View style={styles.formField}>
                      <ThemedText style={styles.formLabel}>
                        Card Number
                      </ThemedText>
                      <TextInput
                        style={styles.input}
                        placeholder="1234 5678 9012 3456"
                        keyboardType="number-pad"
                      />
                    </View>
                  </View>

                  <View style={styles.formRow}>
                    <View style={styles.formField}>
                      <ThemedText style={styles.formLabel}>
                        Cardholder Name
                      </ThemedText>
                      <TextInput style={styles.input} placeholder="John Doe" />
                    </View>
                  </View>

                  <View style={styles.formRowDouble}>
                    <View style={[styles.formField, { flex: 1 }]}>
                      <ThemedText style={styles.formLabel}>
                        Expiry Date
                      </ThemedText>
                      <TextInput style={styles.input} placeholder="MM/YY" />
                    </View>

                    <View style={[styles.formField, { flex: 1 }]}>
                      <ThemedText style={styles.formLabel}>CVV</ThemedText>
                      <TextInput
                        style={styles.input}
                        placeholder="123"
                        keyboardType="number-pad"
                        maxLength={3}
                      />
                    </View>
                  </View>

                  <View style={styles.checkboxRow}>
                    <Switch
                      value={sameAsBilling}
                      onValueChange={setSameAsBilling}
                      trackColor={{
                        false: COLORS.gray[300],
                        true: COLORS.primary,
                      }}
                      thumbColor="#fff"
                    />
                    <ThemedText style={styles.checkboxLabel}>
                      Same as shipping address
                    </ThemedText>
                  </View>
                </View>
              </View>
            )}
          </Animated.View>
        )}

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
            <ThemedText style={styles.summaryLabel}>Tax</ThemedText>
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
        <TouchableOpacity
          onPress={handleContinue}
          style={styles.continueButton}
        >
          <LinearGradient
            colors={COLORS.gradients.primary as [string, string, string]}
            style={styles.continueGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <ThemedText style={styles.continueText}>
              {step === 1 ? "Continue to Payment" : "Place Order"}
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
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.gray[50],
  },
  progressStep: {
    alignItems: "center",
    gap: SPACING.xs,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray[300],
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircleActive: {
    backgroundColor: COLORS.primary,
  },
  stepLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[500],
  },
  stepLabelActive: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.gray[300],
    marginHorizontal: SPACING.xs,
  },
  progressLineActive: {
    backgroundColor: COLORS.primary,
  },
  section: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
  },
  form: {
    gap: SPACING.md,
  },
  formRow: {
    gap: SPACING.xs,
  },
  formRowDouble: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  formField: {
    gap: SPACING.xs,
  },
  formLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
    color: COLORS.gray[700],
  },
  input: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    fontSize: FONT_SIZES.md,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  checkboxLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[700],
  },
  deliveryOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: "transparent",
    marginBottom: SPACING.sm,
  },
  deliveryOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.gray[400],
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryName: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    marginBottom: 2,
  },
  deliveryTime: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
  },
  deliveryPrice: {
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: "transparent",
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  paymentOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  paymentName: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
  },
  paymentLast4: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
  },
  summaryContainer: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
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
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    backgroundColor: "#fff",
  },
  continueButton: {
    borderRadius: BORDER_RADIUS.md,
    overflow: "hidden",
  },
  continueGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  continueText: {
    color: "#fff",
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
  },
});

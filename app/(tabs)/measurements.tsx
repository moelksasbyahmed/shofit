import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
    Alert,
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
import { useMeasurements } from "@/contexts/MeasurementsContext";

const MEASUREMENT_TIPS = [
  {
    icon: "body" as const,
    title: "How to Measure",
    tip: "Use a flexible measuring tape and keep it parallel to the floor",
  },
  {
    icon: "shirt" as const,
    title: "Wear Proper Clothing",
    tip: "Take measurements in form-fitting clothing or undergarments",
  },
  {
    icon: "people" as const,
    title: "Get Help",
    tip: "Ask someone to help you for more accurate measurements",
  },
];

export default function MeasurementsScreen() {
  const { measurements, updateMeasurements } = useMeasurements();
  const [localMeasurements, setLocalMeasurements] = useState(measurements);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalMeasurements(measurements);
  }, [measurements]);

  const handleInputChange = (
    field: keyof typeof measurements,
    value: string,
  ) => {
    // Only allow numbers and decimal point
    const sanitized = value.replace(/[^0-9.]/g, "");
    setLocalMeasurements((prev) => ({ ...prev, [field]: sanitized }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (
      !localMeasurements.shoulders ||
      !localMeasurements.bust ||
      !localMeasurements.waist ||
      !localMeasurements.hips
    ) {
      Alert.alert(
        "Missing Measurements",
        "Please fill in all measurements before saving.",
      );
      return;
    }

    await updateMeasurements(localMeasurements);
    setHasChanges(false);
    Alert.alert("Success", "Your measurements have been saved!");
  };

  const handleReset = () => {
    Alert.alert(
      "Reset Measurements",
      "Are you sure you want to clear all measurements?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            setLocalMeasurements({
              shoulders: "",
              bust: "",
              waist: "",
              hips: "",
            });
            setHasChanges(true);
          },
        },
      ],
    );
  };

  const renderMeasurementInput = (
    label: string,
    field: keyof typeof measurements,
    icon: any,
    delay: number,
  ) => (
    <Animated.View entering={FadeInDown.delay(delay)} style={styles.inputGroup}>
      <View style={styles.inputLabelRow}>
        <Ionicons name={icon} size={20} color={COLORS.primary} />
        <ThemedText style={styles.inputLabel}>{label}</ThemedText>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={localMeasurements[field]}
          onChangeText={(value) => handleInputChange(field, value)}
          placeholder="0.0"
          keyboardType="decimal-pad"
          placeholderTextColor={COLORS.gray[400]}
        />
        <ThemedText style={styles.inputUnit}>cm</ThemedText>
      </View>
    </Animated.View>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
          <Ionicons name="body-outline" size={48} color={COLORS.primary} />
          <ThemedText style={styles.title}>Body Measurements</ThemedText>
          <ThemedText style={styles.subtitle}>
            Enter your measurements for accurate AI fitting
          </ThemedText>
        </Animated.View>

        {/* Measurement Tips */}
        <View style={styles.tipsContainer}>
          {MEASUREMENT_TIPS.map((tip, index) => (
            <Animated.View
              key={index}
              entering={FadeInDown.delay(200 + index * 100)}
              style={styles.tipCard}
            >
              <View style={styles.tipIconContainer}>
                <Ionicons name={tip.icon} size={24} color={COLORS.primary} />
              </View>
              <View style={styles.tipContent}>
                <ThemedText style={styles.tipTitle}>{tip.title}</ThemedText>
                <ThemedText style={styles.tipText}>{tip.tip}</ThemedText>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* Measurement Inputs */}
        <View style={styles.measurementsContainer}>
          {renderMeasurementInput("Shoulders", "shoulders", "resize", 500)}
          {renderMeasurementInput("Bust", "bust", "body", 600)}
          {renderMeasurementInput("Waist", "waist", "ellipse", 700)}
          {renderMeasurementInput("Hips", "hips", "radio-button-off", 800)}
        </View>

        {/* Measurement Guide Image */}
        <Animated.View
          entering={FadeInDown.delay(900)}
          style={styles.guideContainer}
        >
          <ThemedText style={styles.guideTitle}>Measurement Guide</ThemedText>
          <View style={styles.guidePlaceholder}>
            <Ionicons name="body-outline" size={120} color={COLORS.gray[300]} />
            <ThemedText style={styles.guidePlaceholderText}>
              Measurement guide illustration
            </ThemedText>
          </View>
          <View style={styles.guidePoints}>
            <View style={styles.guidePoint}>
              <View style={styles.guidePointDot} />
              <ThemedText style={styles.guidePointText}>
                <ThemedText style={styles.guidePointBold}>
                  Shoulders:
                </ThemedText>{" "}
                Measure across the back from shoulder point to shoulder point
              </ThemedText>
            </View>
            <View style={styles.guidePoint}>
              <View style={styles.guidePointDot} />
              <ThemedText style={styles.guidePointText}>
                <ThemedText style={styles.guidePointBold}>Bust:</ThemedText>{" "}
                Measure around the fullest part of your chest
              </ThemedText>
            </View>
            <View style={styles.guidePoint}>
              <View style={styles.guidePointDot} />
              <ThemedText style={styles.guidePointText}>
                <ThemedText style={styles.guidePointBold}>Waist:</ThemedText>{" "}
                Measure around the narrowest part of your waist
              </ThemedText>
            </View>
            <View style={styles.guidePoint}>
              <View style={styles.guidePointDot} />
              <ThemedText style={styles.guidePointText}>
                <ThemedText style={styles.guidePointBold}>Hips:</ThemedText>{" "}
                Measure around the fullest part of your hips
              </ThemedText>
            </View>
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View
          entering={FadeInDown.delay(1000)}
          style={styles.actionsContainer}
        >
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleReset}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={20} color={COLORS.error} />
            <ThemedText style={styles.resetButtonText}>Reset</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.saveButton,
              !hasChanges && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!hasChanges}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                hasChanges
                  ? [COLORS.primary, "#8B5CF6"]
                  : [COLORS.gray[300], COLORS.gray[400]]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButtonGradient}
            >
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <ThemedText style={styles.saveButtonText}>
                Save Measurements
              </ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl + 10,
  },
  header: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: "700",
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
    textAlign: "center",
  },
  tipsContainer: {
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  tipCard: {
    flexDirection: "row",
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: "center",
  },
  tipIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    marginBottom: 2,
  },
  tipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
  },
  measurementsContainer: {
    gap: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  inputGroup: {
    gap: SPACING.sm,
  },
  inputLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  inputLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    paddingHorizontal: SPACING.md,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.lg,
    fontWeight: "600",
    color: "#000",
  },
  inputUnit: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    color: COLORS.gray[500],
    marginLeft: SPACING.sm,
  },
  guideContainer: {
    marginBottom: SPACING.xl,
  },
  guideTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
    marginBottom: SPACING.md,
  },
  guidePlaceholder: {
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
    minHeight: 200,
  },
  guidePlaceholderText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
    marginTop: SPACING.md,
  },
  guidePoints: {
    gap: SPACING.md,
  },
  guidePoint: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  guidePointDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 6,
  },
  guidePointText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[700],
    lineHeight: 20,
  },
  guidePointBold: {
    fontWeight: "700",
  },
  actionsContainer: {
    flexDirection: "row",
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.error,
  },
  resetButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
    color: COLORS.error,
  },
  saveButton: {
    flex: 1,
    borderRadius: BORDER_RADIUS.full,
    overflow: "hidden",
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  saveButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
    color: "#fff",
  },
});

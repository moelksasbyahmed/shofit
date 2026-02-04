import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import Svg, { Circle, Line } from "react-native-svg";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from "@/constants/design";
import { useMeasurements } from "@/contexts/MeasurementsContext";
import {
    aiMeasurementsService,
    Landmark,
} from "@/services/aiMeasurementsService";

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
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const [annotatedImage, setAnnotatedImage] = useState<string | null>(null);
  const [landmarks, setLandmarks] = useState<Record<string, Landmark> | null>(
    null,
  );
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    setLocalMeasurements(measurements);
  }, [measurements]);

  const handleAICapture = async (mode: "camera" | "gallery") => {
    if (
      !localMeasurements.height ||
      parseFloat(localMeasurements.height) <= 0
    ) {
      Alert.alert(
        "Height Required",
        "Please enter your height in the measurements form first before using AI measurements.",
      );
      return;
    }

    try {
      setIsLoadingAI(true);
      console.log("\n🤖 === STARTING AI MEASUREMENT CAPTURE ===");
      console.log(`Mode: ${mode}`);
      console.log(`User height: ${localMeasurements.height}cm`);
      console.log(`📸 Opening ${mode}...`);

      const imageUri = await aiMeasurementsService.captureFullBodyPhoto(mode);
      console.log("Image URI:", imageUri);

      if (!imageUri) {
        console.log("❌ User cancelled photo selection");
        setIsLoadingAI(false);
        return;
      }

      console.log("✅ Photo captured, sending to API...");
      // Show loading indicator
      Alert.alert("Processing", "Analyzing your body measurements...");

      const aiMeasurements =
        await aiMeasurementsService.getMeasurementsFromImage(
          imageUri,
          parseFloat(localMeasurements.height),
        );

      console.log("🎉 AI measurements received successfully!");
      console.log("=== END AI CAPTURE ===\n");

      // Save annotated image if available
      if (aiMeasurements.annotated_image) {
        setAnnotatedImage(aiMeasurements.annotated_image);
      }

      // Save landmarks and dimensions for visualization
      if (aiMeasurements.landmarks) {
        setLandmarks(aiMeasurements.landmarks);
      }
      if (aiMeasurements.image_dimensions) {
        setImageDimensions(aiMeasurements.image_dimensions);
      }

      // Update local measurements with AI results
      setLocalMeasurements({
        height: localMeasurements.height, // Keep existing height
        shoulders: aiMeasurements.shoulders.toString(),
        bust: aiMeasurements.bust.toString(),
        waist: aiMeasurements.waist.toString(),
        hips: aiMeasurements.hips.toString(),
      });

      setHasChanges(true);
      setUseAI(false);

      Alert.alert(
        "Success",
        `AI measurements calculated:\nShoulders: ${aiMeasurements.shoulders}cm\nBust: ${aiMeasurements.bust}cm\nWaist: ${aiMeasurements.waist}cm\nHips: ${aiMeasurements.hips}cm`,
      );
    } catch (error) {
      console.error("AI measurement error:", error);
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to process image. Please try again.",
      );
    } finally {
      setIsLoadingAI(false);
    }
  };

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
      !localMeasurements.height ||
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
              height: "",
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

        {/* AI Measurements Option */}
        <Animated.View
          entering={FadeInDown.delay(150)}
          style={styles.aiSection}
        >
          <TouchableOpacity
            style={[
              styles.aiToggleButton,
              useAI && styles.aiToggleButtonActive,
            ]}
            onPress={() => setUseAI(!useAI)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={useAI ? "sparkles" : "sparkles-outline"}
              size={24}
              color={useAI ? "#fff" : COLORS.primary}
            />
            <ThemedText
              style={[styles.aiToggleText, useAI && styles.aiToggleTextActive]}
            >
              Use AI Body Measurements
            </ThemedText>
          </TouchableOpacity>

          {useAI && (
            <Animated.View
              entering={FadeInDown.delay(200)}
              style={styles.aiContent}
            >
              <ThemedText style={styles.aiDescription}>
                Take a full-body photo and let AI calculate your measurements
                using advanced pose detection.
              </ThemedText>

              {/* Height Input for AI */}
              <Animated.View
                entering={FadeInDown.delay(250)}
                style={styles.inputGroup}
              >
                <View style={styles.inputLabelRow}>
                  <Ionicons
                    name="resize-outline"
                    size={20}
                    color={COLORS.primary}
                  />
                  <ThemedText style={styles.inputLabel}>Your Height</ThemedText>
                </View>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={localMeasurements.height}
                    onChangeText={(text) =>
                      handleInputChange("height", text.replace(/[^0-9.]/g, ""))
                    }
                    keyboardType="decimal-pad"
                    placeholder="0.0"
                    placeholderTextColor={COLORS.gray[400]}
                  />
                  <ThemedText style={styles.inputUnit}>cm</ThemedText>
                </View>
              </Animated.View>

              {/* AI Capture Buttons */}
              <View style={styles.aiButtonsContainer}>
                <TouchableOpacity
                  style={styles.aiCaptureButton}
                  onPress={() => handleAICapture("camera")}
                  disabled={isLoadingAI || !localMeasurements.height}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.gray[800]]}
                    style={styles.aiCaptureButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {isLoadingAI ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="camera" size={20} color="#fff" />
                        <ThemedText style={styles.aiButtonText}>
                          Take Photo
                        </ThemedText>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.aiCaptureButton}
                  onPress={() => handleAICapture("gallery")}
                  disabled={isLoadingAI || !localMeasurements.height}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[COLORS.gray[700], COLORS.gray[900]]}
                    style={styles.aiCaptureButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {isLoadingAI ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="image" size={20} color="#fff" />
                        <ThemedText style={styles.aiButtonText}>
                          Gallery
                        </ThemedText>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <View style={styles.aiTips}>
                <View style={styles.aiTip}>
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={COLORS.primary}
                  />
                  <ThemedText style={styles.aiTipText}>
                    Stand straight with feet shoulder-width apart
                  </ThemedText>
                </View>
                <View style={styles.aiTip}>
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={COLORS.primary}
                  />
                  <ThemedText style={styles.aiTipText}>
                    Wear form-fitting clothing for better accuracy
                  </ThemedText>
                </View>
                <View style={styles.aiTip}>
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={COLORS.primary}
                  />
                  <ThemedText style={styles.aiTipText}>
                    Ensure good lighting and full body is visible
                  </ThemedText>
                </View>
              </View>
            </Animated.View>
          )}
        </Animated.View>

        {/* Annotated Image Preview - shows independently */}
        {annotatedImage && (
          <Animated.View
            entering={FadeInDown.delay(300)}
            style={styles.annotatedImageContainer}
          >
            <ThemedText style={styles.annotatedImageTitle}>
              Measurement Points
            </ThemedText>
            <View style={styles.imageWithOverlay}>
              <Image
                source={{ uri: `data:image/jpeg;base64,${annotatedImage}` }}
                style={styles.annotatedImage}
                resizeMode="contain"
              />
              {landmarks && imageDimensions && (
                <Svg
                  style={styles.landmarkOverlay}
                  viewBox={`0 0 ${imageDimensions.width} ${imageDimensions.height}`}
                  width="100%"
                  height={400}
                  preserveAspectRatio="xMidYMid meet"
                >
                  {/* Draw skeleton connections */}
                  {/* Shoulders */}
                  {landmarks.left_shoulder && landmarks.right_shoulder && (
                    <Line
                      x1={landmarks.left_shoulder.x * imageDimensions.width}
                      y1={landmarks.left_shoulder.y * imageDimensions.height}
                      x2={landmarks.right_shoulder.x * imageDimensions.width}
                      y2={landmarks.right_shoulder.y * imageDimensions.height}
                      stroke="#00ff00"
                      strokeWidth="4"
                    />
                  )}
                  {/* Left arm */}
                  {landmarks.left_shoulder && landmarks.left_elbow && (
                    <Line
                      x1={landmarks.left_shoulder.x * imageDimensions.width}
                      y1={landmarks.left_shoulder.y * imageDimensions.height}
                      x2={landmarks.left_elbow.x * imageDimensions.width}
                      y2={landmarks.left_elbow.y * imageDimensions.height}
                      stroke="#ffff00"
                      strokeWidth="3"
                    />
                  )}
                  {landmarks.left_elbow && landmarks.left_wrist && (
                    <Line
                      x1={landmarks.left_elbow.x * imageDimensions.width}
                      y1={landmarks.left_elbow.y * imageDimensions.height}
                      x2={landmarks.left_wrist.x * imageDimensions.width}
                      y2={landmarks.left_wrist.y * imageDimensions.height}
                      stroke="#ffff00"
                      strokeWidth="3"
                    />
                  )}
                  {/* Right arm */}
                  {landmarks.right_shoulder && landmarks.right_elbow && (
                    <Line
                      x1={landmarks.right_shoulder.x * imageDimensions.width}
                      y1={landmarks.right_shoulder.y * imageDimensions.height}
                      x2={landmarks.right_elbow.x * imageDimensions.width}
                      y2={landmarks.right_elbow.y * imageDimensions.height}
                      stroke="#ffff00"
                      strokeWidth="3"
                    />
                  )}
                  {landmarks.right_elbow && landmarks.right_wrist && (
                    <Line
                      x1={landmarks.right_elbow.x * imageDimensions.width}
                      y1={landmarks.right_elbow.y * imageDimensions.height}
                      x2={landmarks.right_wrist.x * imageDimensions.width}
                      y2={landmarks.right_wrist.y * imageDimensions.height}
                      stroke="#ffff00"
                      strokeWidth="3"
                    />
                  )}
                  {/* Torso */}
                  {landmarks.left_shoulder && landmarks.left_hip && (
                    <Line
                      x1={landmarks.left_shoulder.x * imageDimensions.width}
                      y1={landmarks.left_shoulder.y * imageDimensions.height}
                      x2={landmarks.left_hip.x * imageDimensions.width}
                      y2={landmarks.left_hip.y * imageDimensions.height}
                      stroke="#00ffff"
                      strokeWidth="3"
                    />
                  )}
                  {landmarks.right_shoulder && landmarks.right_hip && (
                    <Line
                      x1={landmarks.right_shoulder.x * imageDimensions.width}
                      y1={landmarks.right_shoulder.y * imageDimensions.height}
                      x2={landmarks.right_hip.x * imageDimensions.width}
                      y2={landmarks.right_hip.y * imageDimensions.height}
                      stroke="#00ffff"
                      strokeWidth="3"
                    />
                  )}
                  {/* Hips */}
                  {landmarks.left_hip && landmarks.right_hip && (
                    <Line
                      x1={landmarks.left_hip.x * imageDimensions.width}
                      y1={landmarks.left_hip.y * imageDimensions.height}
                      x2={landmarks.right_hip.x * imageDimensions.width}
                      y2={landmarks.right_hip.y * imageDimensions.height}
                      stroke="#ff00ff"
                      strokeWidth="4"
                    />
                  )}
                  {/* Legs */}
                  {landmarks.left_hip && landmarks.left_knee && (
                    <Line
                      x1={landmarks.left_hip.x * imageDimensions.width}
                      y1={landmarks.left_hip.y * imageDimensions.height}
                      x2={landmarks.left_knee.x * imageDimensions.width}
                      y2={landmarks.left_knee.y * imageDimensions.height}
                      stroke="#ff8800"
                      strokeWidth="3"
                    />
                  )}
                  {landmarks.left_knee && landmarks.left_ankle && (
                    <Line
                      x1={landmarks.left_knee.x * imageDimensions.width}
                      y1={landmarks.left_knee.y * imageDimensions.height}
                      x2={landmarks.left_ankle.x * imageDimensions.width}
                      y2={landmarks.left_ankle.y * imageDimensions.height}
                      stroke="#ff8800"
                      strokeWidth="3"
                    />
                  )}
                  {landmarks.right_hip && landmarks.right_knee && (
                    <Line
                      x1={landmarks.right_hip.x * imageDimensions.width}
                      y1={landmarks.right_hip.y * imageDimensions.height}
                      x2={landmarks.right_knee.x * imageDimensions.width}
                      y2={landmarks.right_knee.y * imageDimensions.height}
                      stroke="#ff8800"
                      strokeWidth="3"
                    />
                  )}
                  {landmarks.right_knee && landmarks.right_ankle && (
                    <Line
                      x1={landmarks.right_knee.x * imageDimensions.width}
                      y1={landmarks.right_knee.y * imageDimensions.height}
                      x2={landmarks.right_ankle.x * imageDimensions.width}
                      y2={landmarks.right_ankle.y * imageDimensions.height}
                      stroke="#ff8800"
                      strokeWidth="3"
                    />
                  )}

                  {/* Draw landmark points */}
                  {Object.entries(landmarks).map(([name, landmark]) => (
                    <Circle
                      key={name}
                      cx={landmark.x * imageDimensions.width}
                      cy={landmark.y * imageDimensions.height}
                      r="6"
                      fill="#ffffff"
                      stroke="#000000"
                      strokeWidth="2"
                    />
                  ))}
                </Svg>
              )}
            </View>
            <TouchableOpacity
              onPress={() => setAnnotatedImage(null)}
              style={styles.closeImageButton}
            >
              <Ionicons name="close-circle" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </Animated.View>
        )}

        {!useAI && (
          <>
            <View style={styles.tipsContainer}>
              {MEASUREMENT_TIPS.map((tip, index) => (
                <Animated.View
                  key={index}
                  entering={FadeInDown.delay(200 + index * 100)}
                  style={styles.tipCard}
                >
                  <View style={styles.tipIconContainer}>
                    <Ionicons
                      name={tip.icon}
                      size={24}
                      color={COLORS.primary}
                    />
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
              {renderMeasurementInput("Height", "height", "resize", 400)}
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
              <ThemedText style={styles.guideTitle}>
                Measurement Guide
              </ThemedText>
              <View style={styles.guidePlaceholder}>
                <Ionicons
                  name="body-outline"
                  size={120}
                  color={COLORS.gray[300]}
                />
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
                    Measure across the back from shoulder point to shoulder
                    point
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
                    <ThemedText style={styles.guidePointBold}>
                      Waist:
                    </ThemedText>{" "}
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
          </>
        )}

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
                  ? [COLORS.primary, COLORS.gray[800]]
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
  divider: {
    height: 1,
    backgroundColor: COLORS.gray[200],
    marginVertical: SPACING.lg,
  },
  aiSection: {
    marginBottom: SPACING.lg,
  },
  aiToggleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: "#fff",
  },
  aiToggleButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  aiToggleText: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    color: COLORS.primary,
    flex: 1,
  },
  aiToggleTextActive: {
    color: "#fff",
  },
  aiContent: {
    marginTop: SPACING.lg,
    padding: SPACING.lg,
    backgroundColor: `${COLORS.primary}08`,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: `${COLORS.primary}20`,
  },
  aiDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[700],
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  heightInputGroup: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  aiButtonsContainer: {
    flexDirection: "row",
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  aiCaptureButton: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
    overflow: "hidden",
  },
  aiCaptureButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  aiButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
    color: "#fff",
  },
  aiTips: {
    gap: SPACING.md,
  },
  aiTip: {
    flexDirection: "row",
    gap: SPACING.sm,
    alignItems: "flex-start",
  },
  aiTipText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[700],
    lineHeight: 18,
  },
  annotatedImageContainer: {
    marginTop: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
    backgroundColor: COLORS.gray[100],
    padding: SPACING.md,
    position: "relative",
  },
  annotatedImageTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    marginBottom: SPACING.sm,
    color: COLORS.primary,
  },
  imageWithOverlay: {
    position: "relative",
    width: "100%",
    height: 400,
  },
  annotatedImage: {
    width: "100%",
    height: 400,
    borderRadius: BORDER_RADIUS.md,
  },
  landmarkOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: 400,
  },
  closeImageButton: {
    position: "absolute",
    top: SPACING.md,
    right: SPACING.md,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 4,
  },
});

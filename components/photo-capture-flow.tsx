import {
    BORDER_RADIUS,
    COLORS,
    FONT_SIZES,
    FONT_WEIGHTS,
    SHADOWS,
    SPACING,
} from "@/constants/design";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Dimensions,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    FadeIn,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

export interface CapturedPhotos {
  fullBody: string | null;
}

interface PhotoCaptureFlowProps {
  onComplete: (photos: CapturedPhotos) => void;
  onCancel: () => void;
  productUrl?: string;
}

export function PhotoCaptureFlow({
  onComplete,
  onCancel,
  productUrl,
}: PhotoCaptureFlowProps) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Animation values
  const pulseAnim = useSharedValue(1);

  useEffect(() => {
    // Check if product URL is provided
    if (!productUrl) {
      Alert.alert(
        "Product Required",
        "Please select a product first before taking photos.",
        [{ text: "OK", onPress: onCancel }],
      );
      return;
    }

    // Pulse animation for the capture button
    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 }),
      ),
      -1,
      true,
    );
  }, [productUrl, onCancel, pulseAnim]);

  const capturePhoto = async () => {
    setIsCapturing(true);

    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Camera permission is needed to take photos.",
        );
        setIsCapturing(false);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhoto(result.assets[0].uri);
        setTimeout(() => onComplete({ fullBody: result.assets[0].uri }), 500);
      }
    } catch {
      Alert.alert("Error", "Failed to capture photo. Please try again.");
    } finally {
      setIsCapturing(false);
    }
  };

  const pickFromGallery = async () => {
    setIsCapturing(true);

    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Gallery permission is needed to select photos.",
        );
        setIsCapturing(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhoto(result.assets[0].uri);
        setTimeout(() => onComplete({ fullBody: result.assets[0].uri }), 500);
      }
    } catch {
      Alert.alert("Error", "Failed to select photo. Please try again.");
    } finally {
      setIsCapturing(false);
    }
  };

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  if (!productUrl) {
    return null;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={COLORS.gradients.dark as [string, string, string]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel} style={styles.backButton}>
            <Animated.Text style={styles.backText}>Cancel</Animated.Text>
          </TouchableOpacity>

          <View style={styles.stepIndicator}>
            <Animated.Text style={styles.stepSubtitle}>
              Full Body Photo
            </Animated.Text>
          </View>
        </View>

        {/* Photo preview area */}
        <Animated.View
          style={styles.previewContainer}
          entering={FadeIn.duration(300)}
        >
          {photo ? (
            <View style={styles.photoPreview}>
              <Image
                source={{ uri: photo }}
                style={styles.previewImage}
                contentFit="cover"
              />
              <View style={styles.checkmark}>
                <Animated.Text style={styles.checkmarkText}>✓</Animated.Text>
              </View>
            </View>
          ) : (
            <View style={styles.guidePlaceholder}>
              <View style={styles.silhouetteContainer}>
                <View style={styles.bodyGuide}>
                  <View style={styles.bodyOutline} />
                </View>
              </View>
            </View>
          )}
        </Animated.View>

        {/* Instructions */}
        <Animated.View style={styles.instructionContainer}>
          <Animated.Text style={styles.instructionTitle}>
            Full Body Photo Required
          </Animated.Text>
          <Animated.Text style={styles.instructionText}>
            Stand facing the camera
          </Animated.Text>
          <Animated.Text style={styles.poseGuideText}>
            Tip: Arms slightly away from body, feet shoulder-width apart
          </Animated.Text>
          {productUrl && (
            <Animated.Text style={styles.productText}>
              Product selected
            </Animated.Text>
          )}
        </Animated.View>

        {/* Capture buttons */}
        <View style={styles.captureContainer}>
          <TouchableOpacity
            style={styles.galleryButton}
            onPress={pickFromGallery}
            disabled={isCapturing}
          >
            <Animated.Text style={styles.galleryButtonText}>
              Gallery
            </Animated.Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={capturePhoto}
            disabled={isCapturing}
            activeOpacity={0.8}
          >
            <Animated.View
              style={[styles.captureButtonOuter, pulseAnimatedStyle]}
            >
              <LinearGradient
                colors={COLORS.gradients.primary as [string, string, string]}
                style={styles.captureButton}
              >
                <Animated.Text style={styles.captureIcon}>
                  CAPTURE
                </Animated.Text>
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>

          <View style={styles.galleryButton}>
            <Animated.Text style={styles.galleryLabel}>
              {photo ? "Done" : ""}
            </Animated.Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  backButton: {
    padding: SPACING.sm,
  },
  backText: {
    color: COLORS.gray[400],
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
  },
  stepIndicator: {
    alignItems: "flex-end",
  },
  stepSubtitle: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  previewContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: SPACING.xl,
  },
  photoPreview: {
    width: width - 80,
    height: height * 0.5,
    borderRadius: BORDER_RADIUS.xl,
    overflow: "hidden",
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  checkmark: {
    position: "absolute",
    top: SPACING.md,
    right: SPACING.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.success,
    justifyContent: "center",
    alignItems: "center",
  },
  checkmarkText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: FONT_WEIGHTS.bold,
  },
  guidePlaceholder: {
    width: width - 80,
    height: height * 0.5,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.gray[900],
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  silhouetteContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  bodyGuide: {
    alignItems: "center",
    justifyContent: "center",
  },
  bodyOutline: {
    width: 100,
    height: 250,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    opacity: 0.5,
  },
  instructionContainer: {
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  instructionTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  instructionText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.gray[300],
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  poseGuideText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
    textAlign: "center",
    fontStyle: "italic",
  },
  productText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.success,
    textAlign: "center",
    marginTop: SPACING.sm,
    fontWeight: FONT_WEIGHTS.medium,
  },
  captureContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: SPACING.xxl,
    marginBottom: SPACING.xl,
    paddingBottom: 40,
  },
  galleryButton: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  galleryButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[400],
    fontWeight: FONT_WEIGHTS.medium,
  },
  galleryLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[500],
    marginTop: 4,
  },
  captureButtonOuter: {
    borderRadius: 50,
    padding: 4,
    backgroundColor: "rgba(108, 99, 255, 0.2)",
  },
  captureButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.glow,
  },
  captureIcon: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    fontWeight: FONT_WEIGHTS.bold,
  },
});

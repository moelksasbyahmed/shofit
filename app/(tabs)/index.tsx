import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    FadeIn,
    FadeInDown,
    FadeInUp,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

import { OnboardingScreen } from "@/components/onboarding-screen";
import {
    CapturedPhotos,
    PhotoCaptureFlow,
} from "@/components/photo-capture-flow";
import { WelcomeScreen } from "@/components/welcome-screen";
import { API_CONFIG } from "@/constants/api";
import {
    BORDER_RADIUS,
    COLORS,
    FONT_SIZES,
    FONT_WEIGHTS,
    SHADOWS,
    SPACING,
} from "@/constants/design";

const { width, height: screenHeight } = Dimensions.get("window");

const STORAGE_KEYS = {
  ONBOARDING_COMPLETE: "@shofit_onboarding_complete",
};

interface MeasurementResult {
  shoulder_width_cm: number;
  chest_width_cm: number;
  waist_width_cm: number;
  hip_width_cm: number;
  upper_body_height_cm: number;
  waist_to_hip_ratio: number;
  height_cm: number;
}

interface SizeRecommendation {
  recommended_size: string;
  confidence: string;
  reasoning: string;
  alternative_size?: string;
}

interface ProcessingResult {
  measurements: MeasurementResult;
  recommendation: SizeRecommendation;
  tryOnImage?: string;
  videoUrl?: string;
}

type AppScreen =
  | "welcome"
  | "onboarding"
  | "capture"
  | "main"
  | "processing"
  | "results";

export default function HomeScreen() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("welcome");
  const [photos, setPhotos] = useState<CapturedPhotos | null>(null);
  const [storeUrl, setStoreUrl] = useState("");
  const [height, setHeight] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem(
        STORAGE_KEYS.ONBOARDING_COMPLETE,
      );
      if (completed === "true") {
        // Skip to main after welcome animation
        setTimeout(() => setCurrentScreen("main"), 3000);
      }
    } catch (error) {
      console.log("Error checking onboarding status:", error);
    }
  };

  const handleWelcomeComplete = async () => {
    try {
      const completed = await AsyncStorage.getItem(
        STORAGE_KEYS.ONBOARDING_COMPLETE,
      );
      if (completed === "true") {
        setCurrentScreen("main");
      } else {
        setCurrentScreen("onboarding");
      }
    } catch (error) {
      setCurrentScreen("onboarding");
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, "true");
    } catch (error) {
      console.log("Error saving onboarding status:", error);
    }
    setCurrentScreen("main");
  };

  const handlePhotosCapture = (capturedPhotos: CapturedPhotos) => {
    setPhotos(capturedPhotos);
    setCurrentScreen("main");
  };

  const getImageBase64 = async (uri: string): Promise<string> => {
    const response = await fetch(uri);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(",")[1] || base64;
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleProcess = async () => {
    if (!photos?.fullBody) {
      Alert.alert("Photos Required", "Please capture your body photo first.");
      return;
    }

    if (!storeUrl.trim()) {
      Alert.alert("URL Required", "Please enter a clothing store URL.");
      return;
    }

    if (!height.trim() || isNaN(Number(height))) {
      Alert.alert(
        "Height Required",
        "Please enter your height in centimeters.",
      );
      return;
    }

    setCurrentScreen("processing");
    setIsProcessing(true);

    try {
      // Get base64 for the photo
      const fullBodyBase64 = await getImageBase64(photos.fullBody);

      // Step 1: Get body measurements
      const measurementResponse = await fetch(
        `${API_CONFIG.FASTAPI_URL}/measure`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image_base64: fullBodyBase64,
            height_cm: Number(height),
          }),
        },
      );

      if (!measurementResponse.ok) {
        throw new Error("Failed to analyze body measurements");
      }

      const measurements: MeasurementResult = await measurementResponse.json();

      // Step 2: Scrape size chart
      const scraperResponse = await fetch(
        `${API_CONFIG.NODE_SCRAPER_URL}/scrape-size-chart`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: storeUrl.trim() }),
        },
      );

      let sizeChart = null;
      if (scraperResponse.ok) {
        const scraperData = await scraperResponse.json();
        sizeChart = scraperData.sizeChart;
      }

      // Step 3: Get size recommendation
      const recommendationResponse = await fetch(
        `${API_CONFIG.NODE_SCRAPER_URL}/recommend-size`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ measurements, sizeChart }),
        },
      );

      let recommendation: SizeRecommendation = {
        recommended_size: "M",
        confidence: "medium",
        reasoning: "Based on your measurements",
      };

      if (recommendationResponse.ok) {
        recommendation = await recommendationResponse.json();
      }

      // Step 4: Virtual try-on (optional)
      let tryOnImage: string | undefined;
      try {
        const tryOnResponse = await fetch(
          `${API_CONFIG.FASTAPI_URL}/virtual-tryon`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              person_image_base64: fullBodyBase64,
              clothing_url: storeUrl.trim(),
            }),
          },
        );

        if (tryOnResponse.ok) {
          const tryOnData = await tryOnResponse.json();
          tryOnImage = tryOnData.result_image_base64;
        }
      } catch (e) {
        console.log("Virtual try-on not available");
      }

      setResult({ measurements, recommendation, tryOnImage });
      setCurrentScreen("results");
    } catch (error) {
      console.error("Processing error:", error);
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
      setCurrentScreen("main");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetApp = () => {
    setPhotos(null);
    setStoreUrl("");
    setHeight("");
    setResult(null);
    setCurrentScreen("main");
  };

  // Render different screens
  if (currentScreen === "welcome") {
    return <WelcomeScreen onAnimationComplete={handleWelcomeComplete} />;
  }

  if (currentScreen === "onboarding") {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  if (currentScreen === "capture") {
    return (
      <PhotoCaptureFlow
        onComplete={handlePhotosCapture}
        onCancel={() => setCurrentScreen("main")}
        productUrl={storeUrl}
      />
    );
  }

  if (currentScreen === "processing") {
    return <ProcessingScreen />;
  }

  if (currentScreen === "results" && result) {
    return (
      <ResultsScreen
        result={result}
        photos={photos}
        onReset={resetApp}
        onTryAgain={() => setCurrentScreen("main")}
      />
    );
  }

  // Main screen
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient
        colors={COLORS.gradients.dark as [string, string, string]}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View
            style={styles.header}
            entering={FadeInDown.duration(600).delay(200)}
          >
            <Animated.Text style={styles.logo}>ShoFit</Animated.Text>
            <Animated.Text style={styles.tagline}>
              Find your perfect fit with AI
            </Animated.Text>
          </Animated.View>

          {/* Photo Section */}
          <Animated.View
            style={styles.section}
            entering={FadeInUp.duration(600).delay(400)}
          >
            <View style={styles.sectionHeader}>
              <Animated.Text style={styles.sectionTitle}>
                Full Body Photo
              </Animated.Text>
              <Animated.Text style={styles.sectionSubtitle}>
                {photos ? "1 photo captured" : "Capture full body photo"}
              </Animated.Text>
            </View>

            {photos ? (
              <View style={styles.photosGrid}>
                {photos.fullBody && (
                  <View style={styles.photoThumb}>
                    <Image
                      source={{ uri: photos.fullBody }}
                      style={styles.thumbImage}
                      contentFit="cover"
                    />
                    <Animated.Text style={styles.thumbLabel}>
                      Full Body
                    </Animated.Text>
                  </View>
                )}
              </View>
            ) : (
              <TouchableOpacity
                style={styles.captureCard}
                onPress={() => {
                  if (!storeUrl.trim()) {
                    Alert.alert(
                      "Product Required",
                      "Please enter a product URL first before capturing photos.",
                    );
                    return;
                  }
                  setCurrentScreen("capture");
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["rgba(108,99,255,0.2)", "rgba(108,99,255,0.1)"]}
                  style={styles.captureCardGradient}
                >
                  <Animated.Text style={styles.captureText}>
                    Tap to capture your photo
                  </Animated.Text>
                  <Animated.Text style={styles.captureSubtext}>
                    Full body photo required
                  </Animated.Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {photos && (
              <TouchableOpacity
                style={styles.retakeButton}
                onPress={() => {
                  if (!storeUrl.trim()) {
                    Alert.alert(
                      "Product Required",
                      "Please enter a product URL first before capturing photos.",
                    );
                    return;
                  }
                  setCurrentScreen("capture");
                }}
              >
                <Animated.Text style={styles.retakeText}>
                  Retake Photo
                </Animated.Text>
              </TouchableOpacity>
            )}
          </Animated.View>

          {/* Height Input */}
          <Animated.View
            style={styles.section}
            entering={FadeInUp.duration(600).delay(500)}
          >
            <View style={styles.sectionHeader}>
              <Animated.Text style={styles.sectionTitle}>
                Your Height
              </Animated.Text>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter height in cm (e.g., 175)"
                placeholderTextColor={COLORS.gray[500]}
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
              />
              <Animated.Text style={styles.inputSuffix}>cm</Animated.Text>
            </View>
          </Animated.View>

          {/* URL Input */}
          <Animated.View
            style={styles.section}
            entering={FadeInUp.duration(600).delay(600)}
          >
            <View style={styles.sectionHeader}>
              <Animated.Text style={styles.sectionTitle}>
                Product URL
              </Animated.Text>
            </View>
            <TextInput
              style={[styles.input, styles.urlInput]}
              placeholder="Paste the product page URL"
              placeholderTextColor={COLORS.gray[500]}
              value={storeUrl}
              onChangeText={setStoreUrl}
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </Animated.View>

          {/* Process Button */}
          <Animated.View entering={FadeInUp.duration(600).delay(700)}>
            <TouchableOpacity
              onPress={handleProcess}
              disabled={isProcessing}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={COLORS.gradients.primary as [string, string, string]}
                style={styles.processButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Animated.Text style={styles.processButtonText}>
                  Find My Perfect Size
                </Animated.Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

// Processing Screen Component
function ProcessingScreen() {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withSpring(360, { damping: 2, stiffness: 50 });
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={COLORS.gradients.dark as [string, string, string]}
        style={[styles.gradient, styles.centerContent]}
      >
        <Animated.View entering={FadeIn.duration(600)}>
          <View style={styles.processingIcon}>
            <Animated.Text style={styles.processingEmoji}>🔮</Animated.Text>
          </View>
          <Animated.Text style={styles.processingTitle}>
            Analyzing...
          </Animated.Text>
          <Animated.Text style={styles.processingSubtitle}>
            Our AI is measuring your body and finding the perfect size
          </Animated.Text>
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={{ marginTop: 24 }}
          />
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

// Results Screen Component
interface ResultsScreenProps {
  result: ProcessingResult;
  photos: CapturedPhotos | null;
  onReset: () => void;
  onTryAgain: () => void;
}

function ResultsScreen({
  result,
  photos,
  onReset,
  onTryAgain,
}: ResultsScreenProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={COLORS.gradients.dark as [string, string, string]}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Success Header */}
          <Animated.View
            style={styles.resultsHeader}
            entering={FadeInDown.duration(600)}
          >
            <Animated.Text style={styles.successEmoji}>🎉</Animated.Text>
            <Animated.Text style={styles.resultsTitle}>
              Your Perfect Fit!
            </Animated.Text>
          </Animated.View>

          {/* Size Recommendation Card */}
          <Animated.View entering={FadeInUp.duration(600).delay(200)}>
            <LinearGradient
              colors={["#4CAF50", "#45a049"]}
              style={styles.sizeCard}
            >
              <Animated.Text style={styles.sizeLabel}>
                Recommended Size
              </Animated.Text>
              <Animated.Text style={styles.sizeValue}>
                {result.recommendation.recommended_size}
              </Animated.Text>
              <View style={styles.confidenceBadge}>
                <Animated.Text style={styles.confidenceText}>
                  {result.recommendation.confidence.toUpperCase()} CONFIDENCE
                </Animated.Text>
              </View>
              {result.recommendation.alternative_size && (
                <Animated.Text style={styles.alternativeText}>
                  Alternative: {result.recommendation.alternative_size}
                </Animated.Text>
              )}
            </LinearGradient>
          </Animated.View>

          {/* Measurements Card */}
          <Animated.View
            style={styles.measurementsCard}
            entering={FadeInUp.duration(600).delay(400)}
          >
            <Animated.Text style={styles.cardTitle}>
              Your Measurements
            </Animated.Text>
            <View style={styles.measurementsGrid}>
              <MeasurementItem
                label="Shoulder"
                value={`${result.measurements.shoulder_width_cm?.toFixed(1) || "--"} cm`}
              />
              <MeasurementItem
                label="Chest"
                value={`${result.measurements.chest_width_cm?.toFixed(1) || "--"} cm`}
              />
              <MeasurementItem
                label="Waist"
                value={`${result.measurements.waist_width_cm?.toFixed(1) || "--"} cm`}
              />
              <MeasurementItem
                label="Hip"
                value={`${result.measurements.hip_width_cm?.toFixed(1) || "--"} cm`}
              />
              <MeasurementItem
                label="Upper Body"
                value={`${result.measurements.upper_body_height_cm?.toFixed(1) || "--"} cm`}
              />
              <MeasurementItem
                label="W/H Ratio"
                value={
                  result.measurements.waist_to_hip_ratio?.toFixed(2) || "--"
                }
              />
            </View>
          </Animated.View>

          {/* AI Reasoning */}
          <Animated.View
            style={styles.reasoningCard}
            entering={FadeInUp.duration(600).delay(500)}
          >
            <Animated.Text style={styles.cardTitle}>
              🤖 AI Analysis
            </Animated.Text>
            <Animated.Text style={styles.reasoningText}>
              {result.recommendation.reasoning}
            </Animated.Text>
          </Animated.View>

          {/* Virtual Try-On */}
          {result.tryOnImage && (
            <Animated.View
              style={styles.tryOnCard}
              entering={FadeInUp.duration(600).delay(600)}
            >
              <Animated.Text style={styles.cardTitle}>
                👔 Virtual Try-On
              </Animated.Text>
              <Image
                source={{ uri: `data:image/png;base64,${result.tryOnImage}` }}
                style={styles.tryOnImage}
                contentFit="contain"
              />
            </Animated.View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onTryAgain}
            >
              <Animated.Text style={styles.secondaryButtonText}>
                Try Another
              </Animated.Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onReset}>
              <LinearGradient
                colors={COLORS.gradients.primary as [string, string, string]}
                style={styles.primaryButton}
              >
                <Animated.Text style={styles.primaryButtonText}>
                  Start Over
                </Animated.Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

// Measurement Item Component
function MeasurementItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.measurementItem}>
      <Animated.Text style={styles.measurementLabel}>{label}</Animated.Text>
      <Animated.Text style={styles.measurementValue}>{value}</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: SPACING.xxl,
  },
  logo: {
    fontSize: FONT_SIZES.display,
    fontWeight: FONT_WEIGHTS.extrabold,
    color: COLORS.white,
  },
  tagline: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[400],
    marginTop: SPACING.xs,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.white,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
  },
  captureCard: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: "hidden",
  },
  captureCardGradient: {
    padding: SPACING.xxl,
    alignItems: "center",
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
  },
  captureText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  captureSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[400],
  },
  photosGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: SPACING.md,
  },
  photoThumb: {
    alignItems: "center",
  },
  thumbImage: {
    width: 90,
    height: 120,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xs,
  },
  thumbLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[400],
  },
  retakeButton: {
    marginTop: SPACING.md,
    alignItems: "center",
  },
  retakeText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.gray[900],
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray[800],
  },
  inputSuffix: {
    position: "absolute",
    right: SPACING.lg,
    color: COLORS.gray[500],
    fontSize: FONT_SIZES.md,
  },
  urlInput: {
    paddingRight: SPACING.lg,
  },
  processButton: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: "center",
    marginTop: SPACING.md,
    ...SHADOWS.glow,
  },
  processButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
  },
  // Processing Screen
  processingIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(108,99,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.lg,
    alignSelf: "center",
  },
  processingEmoji: {
    fontSize: 56,
  },
  processingTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.white,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  processingSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[400],
    textAlign: "center",
    paddingHorizontal: SPACING.xl,
  },
  // Results Screen
  resultsHeader: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  successEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  resultsTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.white,
  },
  sizeCard: {
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: "center",
    marginBottom: SPACING.lg,
    ...SHADOWS.lg,
  },
  sizeLabel: {
    fontSize: FONT_SIZES.sm,
    color: "rgba(255,255,255,0.8)",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  sizeValue: {
    fontSize: 72,
    fontWeight: FONT_WEIGHTS.extrabold,
    color: COLORS.white,
  },
  confidenceBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginTop: SPACING.sm,
  },
  confidenceText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  alternativeText: {
    fontSize: FONT_SIZES.sm,
    color: "rgba(255,255,255,0.7)",
    marginTop: SPACING.sm,
  },
  measurementsCard: {
    backgroundColor: COLORS.gray[900],
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.white,
    marginBottom: SPACING.md,
  },
  measurementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  measurementItem: {
    width: "48%",
    backgroundColor: COLORS.gray[800],
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  measurementLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[400],
    marginBottom: 4,
  },
  measurementValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.white,
  },
  reasoningCard: {
    backgroundColor: COLORS.gray[900],
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.lg,
  },
  reasoningText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[300],
    lineHeight: 24,
  },
  tryOnCard: {
    backgroundColor: COLORS.gray[900],
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.lg,
  },
  tryOnImage: {
    width: "100%",
    height: 400,
    borderRadius: BORDER_RADIUS.lg,
  },
  actionButtons: {
    flexDirection: "row",
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  secondaryButton: {
    flex: 1,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 2,
    borderColor: COLORS.gray[700],
    alignItems: "center",
  },
  secondaryButtonText: {
    color: COLORS.gray[300],
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  primaryButton: {
    flex: 1,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: "center",
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
  },
});

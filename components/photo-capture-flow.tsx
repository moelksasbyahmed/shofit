import { BORDER_RADIUS, COLORS, FONT_SIZES, FONT_WEIGHTS, SHADOWS, SPACING } from '@/constants/design';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    FadeIn,
    SlideInRight,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export interface CapturedPhotos {
  face: string | null;
  frontBody: string | null;
  sideBody: string | null;
}

interface PhotoStep {
  id: keyof CapturedPhotos;
  title: string;
  subtitle: string;
  emoji: string;
  instruction: string;
  poseGuide: string;
}

const PHOTO_STEPS: PhotoStep[] = [
  {
    id: 'face',
    title: 'Face Photo',
    subtitle: 'Step 1 of 3',
    emoji: '😊',
    instruction: 'Position your face in the frame',
    poseGuide: 'Look straight at the camera with a neutral expression',
  },
  {
    id: 'frontBody',
    title: 'Front Body',
    subtitle: 'Step 2 of 3',
    emoji: '🧍',
    instruction: 'Stand facing the camera',
    poseGuide: 'Arms slightly away from body, feet shoulder-width apart',
  },
  {
    id: 'sideBody',
    title: 'Side Profile',
    subtitle: 'Step 3 of 3',
    emoji: '🧍‍♂️',
    instruction: 'Turn to show your side',
    poseGuide: 'Stand sideways, arms relaxed at your sides',
  },
];

interface PhotoCaptureFlowProps {
  onComplete: (photos: CapturedPhotos) => void;
  onCancel: () => void;
}

export function PhotoCaptureFlow({ onComplete, onCancel }: PhotoCaptureFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [photos, setPhotos] = useState<CapturedPhotos>({
    face: null,
    frontBody: null,
    sideBody: null,
  });
  const [isCapturing, setIsCapturing] = useState(false);

  // Animation values
  const pulseAnim = useSharedValue(1);
  const progressWidth = useSharedValue(0);

  const currentPhotoStep = PHOTO_STEPS[currentStep];

  useEffect(() => {
    // Pulse animation for the capture button
    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );

    // Update progress bar
    progressWidth.value = withSpring((currentStep / PHOTO_STEPS.length) * 100);
  }, [currentStep]);

  const capturePhoto = async () => {
    setIsCapturing(true);

    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is needed to take photos.');
        setIsCapturing(false);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: currentPhotoStep.id === 'face' ? [1, 1] : [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newPhotos = {
          ...photos,
          [currentPhotoStep.id]: result.assets[0].uri,
        };
        setPhotos(newPhotos);

        // Move to next step or complete
        if (currentStep < PHOTO_STEPS.length - 1) {
          setTimeout(() => setCurrentStep(currentStep + 1), 500);
        } else {
          // All photos captured
          setTimeout(() => onComplete(newPhotos), 500);
        }
      }
    } catch {
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const pickFromGallery = async () => {
    setIsCapturing(true);

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Gallery permission is needed to select photos.');
        setIsCapturing(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: currentPhotoStep.id === 'face' ? [1, 1] : [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newPhotos = {
          ...photos,
          [currentPhotoStep.id]: result.assets[0].uri,
        };
        setPhotos(newPhotos);

        // Move to next step or complete
        if (currentStep < PHOTO_STEPS.length - 1) {
          setTimeout(() => setCurrentStep(currentStep + 1), 500);
        } else {
          setTimeout(() => onComplete(newPhotos), 500);
        }
      }
    } catch {
      Alert.alert('Error', 'Failed to select photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onCancel();
    }
  };

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={COLORS.gradients.dark as [string, string, string]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Animated.Text style={styles.backText}>
              {currentStep > 0 ? '← Back' : '✕ Cancel'}
            </Animated.Text>
          </TouchableOpacity>

          <View style={styles.stepIndicator}>
            <Animated.Text style={styles.stepSubtitle}>
              {currentPhotoStep.subtitle}
            </Animated.Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, progressAnimatedStyle]} />
          </View>
        </View>

        {/* Photo preview area */}
        <Animated.View 
          style={styles.previewContainer}
          entering={FadeIn.duration(300)}
          key={currentStep}
        >
          {photos[currentPhotoStep.id] ? (
            <View style={styles.photoPreview}>
              <Image 
                source={{ uri: photos[currentPhotoStep.id]! }} 
                style={styles.previewImage}
                contentFit="cover"
              />
              <View style={styles.checkmark}>
                <Animated.Text style={styles.checkmarkText}>✓</Animated.Text>
              </View>
            </View>
          ) : (
            <View style={styles.guidePlaceholder}>
              {/* Pose guide silhouette */}
              <View style={styles.silhouetteContainer}>
                <Animated.Text style={styles.guideEmoji}>
                  {currentPhotoStep.emoji}
                </Animated.Text>
                {currentPhotoStep.id === 'face' && (
                  <View style={styles.faceGuide}>
                    <View style={styles.faceOval} />
                  </View>
                )}
                {currentPhotoStep.id === 'frontBody' && (
                  <View style={styles.bodyGuide}>
                    <View style={styles.bodyOutline} />
                  </View>
                )}
                {currentPhotoStep.id === 'sideBody' && (
                  <View style={styles.sideGuide}>
                    <View style={styles.sideOutline} />
                  </View>
                )}
              </View>
            </View>
          )}
        </Animated.View>

        {/* Instructions */}
        <Animated.View 
          style={styles.instructionContainer}
          entering={SlideInRight.duration(300)}
          key={`instruction-${currentStep}`}
        >
          <Animated.Text style={styles.instructionTitle}>
            {currentPhotoStep.title}
          </Animated.Text>
          <Animated.Text style={styles.instructionText}>
            {currentPhotoStep.instruction}
          </Animated.Text>
          <Animated.Text style={styles.poseGuideText}>
            💡 {currentPhotoStep.poseGuide}
          </Animated.Text>
        </Animated.View>

        {/* Capture buttons */}
        <View style={styles.captureContainer}>
          <TouchableOpacity 
            style={styles.galleryButton} 
            onPress={pickFromGallery}
            disabled={isCapturing}
          >
            <Animated.Text style={styles.galleryButtonText}>🖼️</Animated.Text>
            <Animated.Text style={styles.galleryLabel}>Gallery</Animated.Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={capturePhoto}
            disabled={isCapturing}
            activeOpacity={0.8}
          >
            <Animated.View style={[styles.captureButtonOuter, pulseAnimatedStyle]}>
              <LinearGradient
                colors={COLORS.gradients.primary as [string, string, string]}
                style={styles.captureButton}
              >
                <Animated.Text style={styles.captureIcon}>📸</Animated.Text>
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>

          <View style={styles.galleryButton}>
            <Animated.Text style={styles.galleryButtonText}>
              {photos[currentPhotoStep.id] ? '✓' : ''}
            </Animated.Text>
            <Animated.Text style={styles.galleryLabel}>
              {photos[currentPhotoStep.id] ? 'Done' : ''}
            </Animated.Text>
          </View>
        </View>

        {/* Photo thumbnails */}
        <View style={styles.thumbnailContainer}>
          {PHOTO_STEPS.map((step, index) => (
            <TouchableOpacity
              key={step.id}
              style={[
                styles.thumbnail,
                currentStep === index && styles.thumbnailActive,
                photos[step.id] && styles.thumbnailCompleted,
              ]}
              onPress={() => setCurrentStep(index)}
            >
              {photos[step.id] ? (
                <Image 
                  source={{ uri: photos[step.id]! }} 
                  style={styles.thumbnailImage}
                  contentFit="cover"
                />
              ) : (
                <Animated.Text style={styles.thumbnailEmoji}>
                  {step.emoji}
                </Animated.Text>
              )}
              <Animated.Text style={styles.thumbnailLabel}>
                {index + 1}
              </Animated.Text>
            </TouchableOpacity>
          ))}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    alignItems: 'flex-end',
  },
  stepSubtitle: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  progressContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  progressTrack: {
    height: 4,
    backgroundColor: COLORS.gray[800],
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SPACING.xl,
  },
  photoPreview: {
    width: width - 80,
    height: height * 0.4,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  checkmark: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: FONT_WEIGHTS.bold,
  },
  guidePlaceholder: {
    width: width - 80,
    height: height * 0.4,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.gray[900],
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  silhouetteContainer: {
    alignItems: 'center',
  },
  guideEmoji: {
    fontSize: 80,
    marginBottom: SPACING.md,
  },
  faceGuide: {
    position: 'absolute',
    top: 100,
  },
  faceOval: {
    width: 120,
    height: 150,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    opacity: 0.5,
  },
  bodyGuide: {
    position: 'absolute',
    top: 120,
  },
  bodyOutline: {
    width: 80,
    height: 200,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    opacity: 0.3,
  },
  sideGuide: {
    position: 'absolute',
    top: 120,
  },
  sideOutline: {
    width: 60,
    height: 200,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    opacity: 0.3,
  },
  instructionContainer: {
    alignItems: 'center',
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
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  poseGuideText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
    textAlign: 'center',
    fontStyle: 'italic',
  },
  captureContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xxl,
    marginBottom: SPACING.xl,
  },
  galleryButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryButtonText: {
    fontSize: 28,
  },
  galleryLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[500],
    marginTop: 4,
  },
  captureButtonOuter: {
    borderRadius: 50,
    padding: 4,
    backgroundColor: 'rgba(108, 99, 255, 0.2)',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.glow,
  },
  captureIcon: {
    fontSize: 36,
  },
  thumbnailContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.gray[800],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnailActive: {
    borderColor: COLORS.primary,
  },
  thumbnailCompleted: {
    borderColor: COLORS.success,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailEmoji: {
    fontSize: 24,
  },
  thumbnailLabel: {
    position: 'absolute',
    bottom: 2,
    right: 4,
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[500],
    fontWeight: FONT_WEIGHTS.bold,
  },
});

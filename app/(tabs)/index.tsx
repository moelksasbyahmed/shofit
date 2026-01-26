import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// API Configuration - Update these URLs based on your deployment
const API_CONFIG = {
  FASTAPI_URL: 'http://localhost:8000',
  NODE_SCRAPER_URL: 'http://localhost:3001',
};

interface MeasurementResult {
  shoulder_width_cm: number;
  waist_width_cm: number;
  hip_width_cm: number;
  waist_to_hip_ratio: number;
  height_cm: number;
}

interface SizeRecommendation {
  recommended_size: string;
  confidence: string;
  reasoning: string;
}

interface ProcessingResult {
  measurements: MeasurementResult;
  sizeChart: any;
  recommendation: SizeRecommendation;
  tryOnImage?: string;
  videoUrl?: string;
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [image, setImage] = useState<string | null>(null);
  const [storeUrl, setStoreUrl] = useState('');
  const [height, setHeight] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);

  // Request camera permissions and take photo
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is needed to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
    }
  };

  // Pick image from gallery
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Gallery permission is needed to select photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
    }
  };

  // Convert image URI to base64
  const getImageBase64 = async (uri: string): Promise<string> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Remove data URL prefix if present
        const base64Data = base64.split(',')[1] || base64;
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Process the image and URL
  const handleProcess = async () => {
    if (!image) {
      Alert.alert('Missing Photo', 'Please take or select a full-body photo first.');
      return;
    }

    if (!storeUrl.trim()) {
      Alert.alert('Missing URL', 'Please enter a web store URL for the clothing item.');
      return;
    }

    if (!height.trim() || isNaN(Number(height))) {
      Alert.alert('Missing Height', 'Please enter your height in centimeters.');
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      // Step 1: Get body measurements from FastAPI backend
      const imageBase64 = await getImageBase64(image);
      
      const measurementResponse = await fetch(`${API_CONFIG.FASTAPI_URL}/measure`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_base64: imageBase64,
          height_cm: Number(height),
        }),
      });

      if (!measurementResponse.ok) {
        throw new Error('Failed to get body measurements');
      }

      const measurements: MeasurementResult = await measurementResponse.json();

      // Step 2: Scrape size chart from the store URL
      const scraperResponse = await fetch(`${API_CONFIG.NODE_SCRAPER_URL}/scrape-size-chart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: storeUrl.trim(),
        }),
      });

      if (!scraperResponse.ok) {
        throw new Error('Failed to scrape size chart');
      }

      const sizeChartData = await scraperResponse.json();

      // Step 3: Get size recommendation from Gemini
      const recommendationResponse = await fetch(`${API_CONFIG.NODE_SCRAPER_URL}/recommend-size`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          measurements,
          sizeChart: sizeChartData.sizeChart,
        }),
      });

      if (!recommendationResponse.ok) {
        throw new Error('Failed to get size recommendation');
      }

      const recommendation: SizeRecommendation = await recommendationResponse.json();

      // Step 4: Virtual try-on (optional - may take longer)
      let tryOnImage: string | undefined;
      let videoUrl: string | undefined;

      try {
        const tryOnResponse = await fetch(`${API_CONFIG.FASTAPI_URL}/virtual-tryon`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            person_image_base64: imageBase64,
            clothing_url: storeUrl.trim(),
          }),
        });

        if (tryOnResponse.ok) {
          const tryOnData = await tryOnResponse.json();
          tryOnImage = tryOnData.result_image_base64;
          videoUrl = tryOnData.video_url;
        }
      } catch (tryOnError) {
        console.log('Virtual try-on not available:', tryOnError);
      }

      setResult({
        measurements,
        sizeChart: sizeChartData.sizeChart,
        recommendation,
        tryOnImage,
        videoUrl,
      });

    } catch (error) {
      console.error('Processing error:', error);
      Alert.alert(
        'Processing Error',
        error instanceof Error ? error.message : 'An error occurred while processing your request.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setImage(null);
    setStoreUrl('');
    setHeight('');
    setResult(null);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.header}>
          <ThemedText type="title">👗 ShoFit</ThemedText>
          <ThemedText style={styles.subtitle}>
            Find your perfect size with AI
          </ThemedText>
        </ThemedView>

        {/* Photo Section */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">1. Take a Full-Body Photo</ThemedText>
          
          <ThemedView style={styles.photoContainer}>
            {image ? (
              <Image source={{ uri: image }} style={styles.previewImage} contentFit="cover" />
            ) : (
              <ThemedView style={[styles.placeholderImage, { borderColor: colors.icon }]}>
                <ThemedText style={styles.placeholderText}>📷</ThemedText>
                <ThemedText style={styles.placeholderSubtext}>No photo selected</ThemedText>
              </ThemedView>
            )}
          </ThemedView>

          <ThemedView style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.buttonHalf, { backgroundColor: colors.tint }]} 
              onPress={takePhoto}
            >
              <ThemedText style={styles.buttonText}>📸 Camera</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.buttonHalf, { backgroundColor: colors.tint }]} 
              onPress={pickImage}
            >
              <ThemedText style={styles.buttonText}>🖼️ Gallery</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>

        {/* Height Input */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">2. Enter Your Height</ThemedText>
          <TextInput
            style={[styles.input, { 
              color: colors.text, 
              borderColor: colors.icon,
              backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5'
            }]}
            placeholder="Your height in cm (e.g., 175)"
            placeholderTextColor={colors.icon}
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
          />
        </ThemedView>

        {/* URL Input */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">3. Enter Clothing URL</ThemedText>
          <TextInput
            style={[styles.input, { 
              color: colors.text, 
              borderColor: colors.icon,
              backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5'
            }]}
            placeholder="https://store.com/product-page"
            placeholderTextColor={colors.icon}
            value={storeUrl}
            onChangeText={setStoreUrl}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </ThemedView>

        {/* Process Button */}
        <TouchableOpacity 
          style={[
            styles.button, 
            styles.processButton, 
            { backgroundColor: isProcessing ? colors.icon : '#4CAF50' }
          ]} 
          onPress={handleProcess}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ThemedView style={styles.loadingContainer}>
              <ActivityIndicator color="#fff" />
              <ThemedText style={styles.buttonText}> Processing...</ThemedText>
            </ThemedView>
          ) : (
            <ThemedText style={styles.buttonText}>🚀 Process & Find My Size</ThemedText>
          )}
        </TouchableOpacity>

        {/* Results Section */}
        {result && (
          <ThemedView style={styles.resultsSection}>
            <ThemedText type="title" style={styles.resultsTitle}>📊 Results</ThemedText>

            {/* Size Recommendation */}
            <ThemedView style={[styles.resultCard, { backgroundColor: '#4CAF50' }]}>
              <ThemedText style={styles.resultCardTitle}>Recommended Size</ThemedText>
              <ThemedText style={styles.sizeText}>{result.recommendation.recommended_size}</ThemedText>
              <ThemedText style={styles.confidenceText}>
                Confidence: {result.recommendation.confidence}
              </ThemedText>
            </ThemedView>

            {/* Measurements */}
            <ThemedView style={[styles.resultCard, { backgroundColor: colors.tint }]}>
              <ThemedText style={styles.resultCardTitle}>Your Measurements</ThemedText>
              <ThemedText style={styles.measurementText}>
                Shoulder Width: {result.measurements.shoulder_width_cm.toFixed(1)} cm
              </ThemedText>
              <ThemedText style={styles.measurementText}>
                Waist Width: {result.measurements.waist_width_cm.toFixed(1)} cm
              </ThemedText>
              <ThemedText style={styles.measurementText}>
                Hip Width: {result.measurements.hip_width_cm.toFixed(1)} cm
              </ThemedText>
              <ThemedText style={styles.measurementText}>
                Waist-to-Hip Ratio: {result.measurements.waist_to_hip_ratio.toFixed(2)}
              </ThemedText>
            </ThemedView>

            {/* Reasoning */}
            <ThemedView style={[styles.resultCard, { backgroundColor: colorScheme === 'dark' ? '#333' : '#f0f0f0' }]}>
              <ThemedText style={[styles.resultCardTitle, { color: colors.text }]}>AI Analysis</ThemedText>
              <ThemedText style={{ color: colors.text }}>{result.recommendation.reasoning}</ThemedText>
            </ThemedView>

            {/* Virtual Try-On Result */}
            {result.tryOnImage && (
              <ThemedView style={styles.tryOnSection}>
                <ThemedText type="subtitle">Virtual Try-On</ThemedText>
                <Image 
                  source={{ uri: `data:image/png;base64,${result.tryOnImage}` }} 
                  style={styles.tryOnImage} 
                  contentFit="contain"
                />
              </ThemedView>
            )}

            {/* Reset Button */}
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: '#ff6b6b', marginTop: 16 }]} 
              onPress={resetForm}
            >
              <ThemedText style={styles.buttonText}>🔄 Start Over</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  subtitle: {
    opacity: 0.7,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  photoContainer: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  previewImage: {
    width: 200,
    height: 267,
    borderRadius: 12,
  },
  placeholderImage: {
    width: 200,
    height: 267,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 48,
  },
  placeholderSubtext: {
    marginTop: 8,
    opacity: 0.6,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonHalf: {
    flex: 1,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginTop: 8,
  },
  processButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  resultsSection: {
    marginTop: 16,
  },
  resultsTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  resultCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  resultCardTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  sizeText: {
    color: '#fff',
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  confidenceText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.9,
  },
  measurementText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 4,
  },
  tryOnSection: {
    marginTop: 16,
    alignItems: 'center',
  },
  tryOnImage: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    marginTop: 12,
  },
});

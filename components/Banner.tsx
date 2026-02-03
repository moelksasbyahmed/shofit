import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ImageBackground, 
  TouchableOpacity, 
  Dimensions,
  Platform 
} from 'react-native';

interface BannerProps {
  onExplorePress?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function Banner({ onExplorePress }: BannerProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const totalSlides = 3;

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <ImageBackground
        source={{ uri: 'https://api.builder.io/api/v1/image/assets/TEMP/3d20b44bdd91c58cca733cdc4eddc98adda5edf8?width=1112' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* Text Overlay - Exact Figma Positioning */}
      <Text style={styles.luxuryText}>Luxury</Text>
      <Text style={styles.fashionText}>Fashion</Text>
      <Text style={styles.ampersandText}>&</Text>
      <Text style={styles.accessoriesText}>Accessories</Text>

      {/* CTA Button */}
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={onExplorePress}
        activeOpacity={0.8}
      >
        <Text style={styles.ctaButtonText}>Explore Collection</Text>
      </TouchableOpacity>

      {/* Pagination Dots */}
      <View style={styles.paginationContainer}>
        <View style={[styles.paginationDot, activeSlide === 0 && styles.paginationDotActive, { left: 0 }]} />
        <View style={[styles.paginationDot, activeSlide === 1 && styles.paginationDotActive, { left: 16 }]} />
        <View style={[styles.paginationDot, activeSlide === 2 && styles.paginationDotActive, { left: 32 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: 600,
    overflow: 'hidden',
    position: 'relative',
  },
  backgroundImage: {
    width: 556,
    height: 620,
    position: 'absolute',
    left: -77,
    top: -17,
  },
  luxuryText: {
    position: 'absolute',
    left: 43,
    top: 231,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
    fontSize: 39,
    fontWeight: '700',
    fontStyle: 'italic',
    color: '#333333',
    opacity: 0.7,
    letterSpacing: 1.208,
    lineHeight: 43.488,
  },
  fashionText: {
    position: 'absolute',
    left: 60,
    top: 270,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
    fontSize: 39,
    fontWeight: '700',
    fontStyle: 'italic',
    color: '#333333',
    opacity: 0.7,
    letterSpacing: 1.208,
    lineHeight: 43.488,
  },
  ampersandText: {
    position: 'absolute',
    left: 37,
    top: 317,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
    fontSize: 31,
    fontWeight: '700',
    fontStyle: 'italic',
    color: '#333333',
    opacity: 0.7,
    lineHeight: 34.418,
  },
  accessoriesText: {
    position: 'absolute',
    left: 65,
    top: 309,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
    fontSize: 39,
    fontWeight: '700',
    fontStyle: 'italic',
    color: '#333333',
    opacity: 0.7,
    letterSpacing: 1.208,
    lineHeight: 43.488,
  },
  ctaButton: {
    position: 'absolute',
    left: 61,
    top: 520,
    width: 253,
    height: 40,
    paddingVertical: 8,
    paddingHorizontal: 30,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaButtonText: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'sans-serif',
      default: 'sans-serif',
    }),
    fontSize: 16,
    fontWeight: '400',
    color: '#FCFCFC',
    lineHeight: 24,
  },
  paginationContainer: {
    position: 'absolute',
    left: 168,
    top: 574,
    width: 40,
    height: 8,
  },
  paginationDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    backgroundColor: 'transparent',
    transform: [{ rotate: '45deg' }],
    borderWidth: 0.5,
    borderColor: '#FCFCFC',
  },
  paginationDotActive: {
    backgroundColor: '#FCFCFC',
    borderWidth: 0,
  },
});

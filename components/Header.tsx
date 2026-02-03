import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface HeaderProps {
  onMenuPress?: () => void;
  onSearchPress?: () => void;
  onCartPress?: () => void;
}

const MenuIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M0.306763 12H15.9824" stroke="#14142B" />
    <Path d="M0.306641 5H23.6931" stroke="#14142B" />
    <Path d="M0.306641 19H23.6931" stroke="#14142B" />
  </Svg>
);

const SearchIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path 
      d="M11 20C15.9706 20 20 15.9706 20 11C20 6.02944 15.9706 2 11 2C6.02944 2 2 6.02944 2 11C2 15.9706 6.02944 20 11 20Z" 
      stroke="#14142B" 
    />
    <Path d="M22 21.9999L18.7823 18.7822" stroke="#14142B" />
  </Svg>
);

const ShoppingBagIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path 
      d="M20.6592 6.7207L21.4756 23.2803H3.49512L4.31152 6.7207H20.6592Z" 
      stroke="#14142B" 
    />
    <Path 
      d="M8.1604 10.1491L8.1604 5.55139C8.1604 4.40438 8.61605 3.30434 9.42711 2.49328C10.2382 1.68221 11.3382 1.22656 12.4852 1.22656C13.6322 1.22656 14.7323 1.68221 15.5433 2.49328C16.3544 3.30434 16.8101 4.40438 16.8101 5.55139V10.1491" 
      stroke="#14142B" 
    />
  </Svg>
);

export default function Header({ onMenuPress, onSearchPress, onCartPress }: HeaderProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={onMenuPress}
        activeOpacity={0.7}
      >
        <MenuIcon />
      </TouchableOpacity>

      <Image
        source={{ uri: 'https://api.builder.io/api/v1/image/assets/TEMP/383078040577d3f41920f45abb7d9a081e7ff650?width=156' }}
        style={styles.logo}
        resizeMode="contain"
      />

      <TouchableOpacity
        style={styles.searchButton}
        onPress={onSearchPress}
        activeOpacity={0.7}
      >
        <SearchIcon />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cartButton}
        onPress={onCartPress}
        activeOpacity={0.7}
      >
        <ShoppingBagIcon />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 60,
    backgroundColor: '#E7EAEF',
    position: 'relative',
  },
  menuButton: {
    position: 'absolute',
    left: 16,
    top: 23,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    position: 'absolute',
    left: 142,
    top: 19,
    width: 78,
    height: 32,
    opacity: 0.8,
  },
  searchButton: {
    position: 'absolute',
    left: 288,
    top: 24,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartButton: {
    position: 'absolute',
    left: 328,
    top: 24,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

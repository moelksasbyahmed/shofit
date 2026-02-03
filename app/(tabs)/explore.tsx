import React from 'react';
import { ScrollView, StyleSheet, View, StatusBar } from 'react-native';
import Header from '@/components/Header';
import Banner from '@/components/Banner';

export default function ExploreScreen() {
  const handleMenuPress = () => {
    console.log('Menu pressed');
  };

  const handleSearchPress = () => {
    console.log('Search pressed');
  };

  const handleCartPress = () => {
    console.log('Cart pressed');
  };

  const handleExplorePress = () => {
    console.log('Explore collection pressed');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E7EAEF" />
      <Header
        onMenuPress={handleMenuPress}
        onSearchPress={handleSearchPress}
        onCartPress={handleCartPress}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Banner onExplorePress={handleExplorePress} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFCFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});

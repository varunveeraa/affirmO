import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import VerticalScrollText from '@/components/VerticalScrollText';

const AffirmReel = () => {
  const { affirmations } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <VerticalScrollText affirmations={JSON.parse(affirmations as string)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});

export default AffirmReel;

import Slider from '@react-native-community/slider';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface FeatureSliderProps {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  color?: string;
}

export function FeatureSlider({
  label,
  value,
  onValueChange,
  min,
  max,
  step,
  color = '#3498DB',
}: FeatureSliderProps) {
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color }]}>{label}</Text>
      <View style={styles.sliderRow}>
        <Slider
          style={styles.slider}
          minimumValue={min}
          maximumValue={max}
          step={step}
          value={value}
          onValueChange={onValueChange}
          minimumTrackTintColor={color}
          maximumTrackTintColor="#cccccc"
          thumbTintColor={color}
        />
        <Text style={styles.value}>{value.toFixed(3)}</Text>
      </View>
      <View style={styles.rangeRow}>
        <Text style={styles.rangeText}>{min}</Text>
        <Text style={styles.rangeText}>{max}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
  label: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 2,
    marginLeft: 2,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slider: {
    flex: 1,
    height: 40,
    backgroundColor: 'transparent',
  },
  value: {
    width: 52,
    textAlign: 'right',
    color: '#222',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
    marginBottom: 2,
  },
  rangeText: {
    color: '#888',
    fontSize: 12,
  },
});

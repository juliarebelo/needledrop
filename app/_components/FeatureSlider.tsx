import { Feather } from '@expo/vector-icons';
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
  icon?: keyof typeof Feather.glyphMap;
  unit?: string;
}

export function FeatureSlider({
  label,
  value,
  onValueChange,
  min,
  max,
  step,
  icon = 'sliders',
  unit = ''
}: FeatureSliderProps) {
  // Normalizar valor para porcentagem visual
  const percentage = ((value - min) / (max - min)) * 100;
  
  // Cor baseada no valor
  const getColor = () => {
    if (percentage < 33) return '#E74C3C';
    if (percentage < 66) return '#F39C12';
    return '#27AE60';
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.labelContainer}>
          <Feather name={icon} size={16} color="#FFFFFF" style={styles.icon} />
          <Text style={styles.label}>{label}</Text>
        </View>
        <Text style={styles.value}>{value.toFixed(step < 1 ? 2 : 0)}{unit}</Text>
      </View>
      
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={min}
          maximumValue={max}
          step={step}
          value={value}
          onValueChange={onValueChange}
          minimumTrackTintColor={getColor()}
          maximumTrackTintColor="#4a1e1e"
          thumbTintColor={getColor()}
        />
        <View style={styles.marksContainer}>
          <Text style={styles.markText}>{min}</Text>
          <Text style={styles.markText}>{max}</Text>
        </View>
      </View>
      
      {/* Barra visual de indicador */}
      <View style={styles.indicatorBar}>
        <View 
          style={[
            styles.indicatorFill, 
            { width: `${percentage}%`, backgroundColor: getColor() }
          ]} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    backgroundColor: '#4a1e1e',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#6a2e2e',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 8,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  value: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 60,
    textAlign: 'right',
  },
  sliderContainer: {
    marginVertical: 5,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  marksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  markText: {
    color: '#999',
    fontSize: 11,
  },
  indicatorBar: {
    height: 4,
    backgroundColor: '#2a0a0a',
    borderRadius: 2,
    marginTop: 5,
    overflow: 'hidden',
  },
  indicatorFill: {
    height: '100%',
    borderRadius: 2,
  },
});

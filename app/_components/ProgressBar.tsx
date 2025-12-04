import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Goal } from '../../app/_types/Goal';

interface ProgressBarProps {
  goal: Goal;
  height?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ goal, height = 20 }) => {
  const progress = (goal.current_count / goal.target_count) * 100;
  const isOverdue = goal.deadline && new Date(goal.deadline) < new Date();

  return (
    <View style={styles.container}>
      <View style={[styles.progressBackground, { height }]}>
        <View 
          style={[
            styles.progressFill, 
            { 
              width: `${progress}%`,
              height,
              backgroundColor: isOverdue ? '#dc2626' : '#16a34a'
            }
          ]} 
        />
      </View>
      <View style={styles.progressText}>
        <Text style={styles.countText}>
          {goal.current_count} / {goal.target_count}
        </Text>
        <Text style={styles.percentageText}>
          {Math.round(progress)}%
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  progressBackground: {
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 10,
  },
  progressText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  countText: {
    color: '#6b7280',
    fontSize: 12,
  },
  percentageText: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface StarRatingProps {
  rating: number;
  size?: number;
  color?: string;
  emptyColor?: string;
}

const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  size = 16, 
  color = '#FFD700', 
  emptyColor = '#666' 
}) => {
  const ratingNumber = Number(rating);
  const renderStar = (position: number) => {
    const isFilled = position <= ratingNumber;
    const isHalf = position - 0.5 <= ratingNumber && position > ratingNumber;

    if (isHalf) {
      return (
        <View key={position} style={[styles.starContainer, { width: size, height: size }]}>
          <FontAwesome
            name="star"
            size={size}
            color={emptyColor}
            style={styles.starBackground}
          />
          <View style={[styles.halfStarContainer, { width: size / 2, height: size }]}>
            <FontAwesome
              name="star"
              size={size}
              color={color}
            />
          </View>
        </View>
      );
    }

    return (
      <FontAwesome
        key={position}
        name="star"
        size={size}
        color={isFilled ? color : emptyColor}
      />
    );
  };

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map(renderStar)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  starContainer: {
    position: 'relative',
  },
  starBackground: {
    position: 'absolute',
  },
  halfStarContainer: {
    overflow: 'hidden',
  },
});

export default StarRating;

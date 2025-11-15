import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Resenha } from '../../hooks/useUserReviews';

interface ReviewListProps {
  reviews: Resenha[];
  onRefresh: () => void;
  refreshing: boolean;
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews, onRefresh, refreshing }) => {
  const router = useRouter();

  const handleEditReview = (review: Resenha) => {
    router.push({
      pathname: '/album-review',
      params: {
        albumName: encodeURIComponent(review.album_name),
        artist: encodeURIComponent(review.artist),
        year: review.year.toString(),
        trackCount: review.track_count.toString(),
        coverUrl: encodeURIComponent(review.cover_url || '')
      }
    });
  };

  const renderReviewItem = ({ item }: { item: Resenha }) => (
    <TouchableOpacity 
      style={styles.reviewItem}
      onPress={() => handleEditReview(item)}
    >
      <Image
        source={{ uri: item.cover_url || 'https://via.placeholder.com/150' }}
        style={styles.albumImage}
      />
      <View style={styles.reviewContent}>
        <Text style={styles.albumName}>{item.album_name}</Text>
        <Text style={styles.artist}>{item.artist}</Text>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Feather
              key={star}
              name="star"
              size={16}
              color={star <= item.rating ? '#FFD700' : '#666'}
            />
          ))}
        </View>
        <Text style={styles.reviewText} numberOfLines={2}>
          {item.review_text}
        </Text>
        <Text style={styles.reviewDate}>
          {new Date(item.updated_at).toLocaleDateString('pt-BR')}
        </Text>
      </View>
      <Feather name="edit-2" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={reviews}
      renderItem={renderReviewItem}
      keyExtractor={(item) => item.id}
      onRefresh={onRefresh}
      refreshing={refreshing}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 10,
  },
  reviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4a1e1e',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  albumImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
    marginRight: 15,
  },
  reviewContent: {
    flex: 1,
  },
  albumName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  artist: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  reviewText: {
    color: '#ddd',
    fontSize: 12,
    marginBottom: 5,
  },
  reviewDate: {
    color: '#888',
    fontSize: 10,
  },
});

export default ReviewList;
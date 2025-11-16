import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    FlatList,
    Image,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { supabase } from '../../services/supabase';
import StarRating from '../_components/StarRating';

interface Review {
  id: string;
  album_name: string;
  artist: string;
  rating: number;
  review_text: string;
  album_cover: string;
  created_at: string;
  year: number;
}

interface ReviewItemProps {
  item: Review;
  onEdit: (review: Review) => void;
  onDelete: (reviewId: string, albumName: string) => void;
}

const ReviewItem = ({ item, onEdit, onDelete }: ReviewItemProps) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const [swiped, setSwiped] = useState(false);

  const renderStars = (rating: number) => {
    return <StarRating rating={rating} size={16} />;
  };

  const onSwipeLeft = () => {
    Animated.timing(translateX, {
      toValue: -80,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setSwiped(true);
  };

  const onSwipeRight = () => {
    Animated.timing(translateX, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setSwiped(false);
  };

  return (
    <View style={styles.reviewItemContainer}>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => onDelete(item.id, item.album_name)}
      >
        <Feather name="trash-2" size={24} color="#fff" />
      </TouchableOpacity>
      
      <Animated.View style={[styles.reviewItemWrapper, { transform: [{ translateX }] }]}>
        <TouchableOpacity 
          style={styles.reviewItem}
          onPress={() => onEdit(item)}
          onLongPress={onSwipeLeft}
        >
          <Image
            source={{ uri: item.album_cover || 'https://via.placeholder.com/80' }}
            style={styles.albumImage}
          />
          <View style={styles.reviewContent}>
            <Text style={styles.albumName}>{item.album_name}</Text>
            <Text style={styles.artist}>{item.artist}</Text>
            {renderStars(item.rating)}
            <Text style={styles.reviewText} numberOfLines={2}>
              {item.review_text}
            </Text>
            <Text style={styles.reviewDate}>
              {new Date(item.created_at).toLocaleDateString('pt-BR')}
            </Text>
          </View>
          <View style={styles.actionsContainer}>
            <Feather name="edit-2" size={20} color="#ccc" />
            <TouchableOpacity 
              style={styles.swipeHint}
              onPress={swiped ? onSwipeRight : onSwipeLeft}
            >
              <Feather 
                name={swiped ? "chevron-right" : "chevron-left"} 
                size={20} 
                color="#888" 
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default function MinhasResenhasScreen() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      fetchUserReviews();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUserReviews();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchUserReviews();
  }, []);

  const fetchUserReviews = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      if (session?.user) {
        const { data, error } = await supabase
          .from('resenhas')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        // Garante que rating seja number (numeric pode vir como string)
        const normalized = (data || []).map(r => ({
          ...r,
          rating: typeof r.rating === 'string' ? parseFloat(r.rating) : r.rating
        }));
        console.log('[DEBUG] Total resenhas carregadas:', normalized.length);
        normalized.slice(0,10).forEach((r, idx) => {
          console.log(`[DEBUG] Resenha ${idx} rating bruto:`, r.rating, 'tipo:', typeof r.rating);
        });
        setReviews(normalized);
      }
    } catch (error) {
      console.error('Erro ao buscar resenhas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditReview = (review: Review) => {
    router.push({
      pathname: '/album-review',
      params: {
        albumName: encodeURIComponent(review.album_name),
        artist: encodeURIComponent(review.artist),
        year: review.year.toString(),
        trackCount: '12',
        coverUrl: encodeURIComponent(review.album_cover || '')
      }
    });
  };

  const handleDeleteReview = (reviewId: string, albumName: string) => {
    Alert.alert(
      'Remover Resenha',
      `Tem certeza que deseja remover a resenha de "${albumName}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('resenhas')
                .delete()
                .eq('id', reviewId);

              if (error) throw error;

              setReviews(reviews.filter(r => r.id !== reviewId));
              Alert.alert('Sucesso', 'Resenha removida com sucesso');
            } catch (error) {
              console.error('Erro ao remover resenha:', error);
              Alert.alert('Erro', 'Não foi possível remover a resenha');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Carregando resenhas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Minhas Resenhas</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={reviews}
        renderItem={({ item }) => (
          <ReviewItem 
            item={item} 
            onEdit={handleEditReview}
            onDelete={handleDeleteReview}
          />
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#FFFFFF']}
            tintColor="#FFFFFF"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="file-text" size={60} color="#666" />
            <Text style={styles.emptyText}>Nenhuma resenha encontrada</Text>
            <Text style={styles.emptySubtext}>
              Comece a escrever resenhas dos seus álbuns favoritos!
            </Text>
            <TouchableOpacity 
              style={styles.browseButton}
              onPress={() => router.push('/(tabs)/busca')}
            >
              <Text style={styles.browseButtonText}>Explorar Álbuns</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#300505',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#300505',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 53,
    paddingBottom: 15,
    backgroundColor: '#4a1e1e',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 24,
  },
  listContainer: {
    padding: 20,
  },
  reviewItemContainer: {
    marginBottom: 12,
    position: 'relative',
  },
  reviewItemWrapper: {
    width: '100%',
  },
  reviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4a1e1e',
    borderRadius: 8,
    padding: 15,
  },
  deleteButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
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
  actionsContainer: {
    alignItems: 'center',
    gap: 10,
  },
  swipeHint: {
    marginTop: 5,
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
  starsContainer: {
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  emptySubtext: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  browseButton: {
    backgroundColor: '#8b0000',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
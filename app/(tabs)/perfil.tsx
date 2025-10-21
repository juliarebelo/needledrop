import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { supabase } from '../../services/supabase';

interface Review {
  id: string;
  album_name: string;
  artist: string;
  rating: number;
  review_text: string;
  cover_url: string;
  created_at: string;
}

interface FavoriteAlbum {
  id: string;
  album_name: string;
  artist: string;
  cover_url: string;
}

export default function PerfilScreen() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [favoriteAlbums, setFavoriteAlbums] = useState<FavoriteAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      if (session?.user) {
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('resenhas')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (reviewsError) console.error('Erro ao buscar resenhas:', reviewsError);

        const { data: favoritesData, error: favoritesError } = await supabase
          .from('resenhas')
          .select('id, album_name, artist, cover_url')
          .eq('user_id', session.user.id)
          .order('rating', { ascending: false })
          .limit(4);

        if (favoritesError) console.error('Erro ao buscar favoritos:', favoritesError);

        setReviews(reviewsData || []);
        setFavoriteAlbums(favoritesData || []);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Feather
            key={star}
            name="star"
            size={16}
            color={star <= rating ? '#FFD700' : '#ddd'}
            style={styles.star}
          />
        ))}
      </View>
    );
  };

  const renderFavoriteAlbum = ({ item }: { item: FavoriteAlbum }) => (
    <View style={styles.favoriteAlbum}>
      <Image
        source={{ uri: item.cover_url || 'https://via.placeholder.com/80' }}
        style={styles.albumImage}
      />
      <Text style={styles.albumName} numberOfLines={1}>
        {item.album_name}
      </Text>
      <Text style={styles.albumArtist} numberOfLines={1}>
        {item.artist}
      </Text>
    </View>
  );

  const renderReview = ({ item }: { item: Review }) => (
    <View style={styles.reviewCard}>
      {renderStars(item.rating)}
      <Text style={styles.reviewText} numberOfLines={2}>
        {item.review_text}
      </Text>
    </View>
  );

  const getUserName = () => {
    if (user?.user_metadata?.name) {
      return user.user_metadata.name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Usuário';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header do Perfil */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Feather name="user" size={60} color="#fff" />
          </View>
          <Text style={styles.userName}>{getUserName()}</Text>
          <Text style={styles.userEmail}>{user?.email || 'Não logado'}</Text>
        </View>

        {/* Seção de Álbuns Favoritos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Álbuns Favoritos</Text>
            <TouchableOpacity onPress={() => router.push('../minhas-resenhas')}>
              <Text style={styles.seeAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          
          {favoriteAlbums.length > 0 ? (
            <FlatList
              data={favoriteAlbums}
              renderItem={renderFavoriteAlbum}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.favoritesList}
            />
          ) : (
            <View style={styles.emptySection}>
              <Feather name="music" size={40} color="#666" />
              <Text style={styles.emptyText}>Nenhum álbum favorito</Text>
            </View>
          )}
        </View>

        {/* Seção de Avaliações Recentes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Avaliações recentes</Text>
            <TouchableOpacity onPress={() => router.push('../minhas-resenhas')}>
              <Text style={styles.seeAllText}>Ver todas</Text>
            </TouchableOpacity>
          </View>

          {reviews.length > 0 ? (
            <FlatList
              data={reviews}
              renderItem={renderReview}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.reviewsList}
            />
          ) : (
            <View style={styles.emptySection}>
              <Feather name="file-text" size={40} color="#666" />
              <Text style={styles.emptyText}>Nenhuma avaliação</Text>
              <TouchableOpacity 
                style={styles.createReviewButton}
                onPress={() => router.push('/(tabs)/busca')}
              >
                <Text style={styles.createReviewButtonText}>Criar primeira resenha</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#300505',
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#4a1e1e',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#8b0000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#fff',
  },
  userName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userEmail: {
    color: '#ccc',
    fontSize: 16,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  seeAllText: {
    color: '#8b0000',
    fontSize: 14,
    fontWeight: '600',
  },
  favoritesList: {
    paddingRight: 20,
  },
  favoriteAlbum: {
    alignItems: 'center',
    marginRight: 20,
    width: 100,
  },
  albumImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  albumName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  albumArtist: {
    color: '#ccc',
    fontSize: 10,
    textAlign: 'center',
  },
  reviewsList: {
    gap: 12,
  },
  reviewCard: {
    backgroundColor: '#4a1e1e',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#8b0000',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  star: {
    marginRight: 2,
  },
  reviewText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 18,
  },
  emptySection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  createReviewButton: {
    backgroundColor: '#8b0000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  createReviewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
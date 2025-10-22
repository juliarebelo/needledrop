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
import CustomBottomNav from '../components/CustomBottomNav';

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
        const { data: reviewsData } = await supabase
          .from('resenhas')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        const { data: favoritesData } = await supabase
          .from('resenhas')
          .select('id, album_name, artist, cover_url')
          .eq('user_id', session.user.id)
          .order('rating', { ascending: false })
          .limit(4);

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
          <Text 
            key={star} 
            style={[
              styles.star,
              star <= rating ? styles.starFilled : styles.starEmpty
            ]}
          >
            ★
          </Text>
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
        {item.review_text || 'Remarks'}
      </Text>
    </View>
  );

  const getUserName = () => {
    return user?.user_metadata?.name || user?.email?.split('@')[0] || 'Billy';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Feather name="user" size={40} color="#fff" />
          </View>
          <Text style={styles.userName}>{getUserName()}</Text>
          <Text style={styles.userEmail}>{user?.email || 'monobolasclub@gmail.com'}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Álbuns Favoritos</Text>
            <TouchableOpacity onPress={() => router.push('/minhas-resenhas')}>
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
              <Text style={styles.albumName}>EXATAMENTE AGORA</Text>
              <Text style={styles.albumArtist}>Bruno & Marrone</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Avaliações recentes</Text>
            <TouchableOpacity onPress={() => router.push('/minhas-resenhas')}>
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
            <View style={styles.reviewsList}>
              <View style={styles.reviewCard}>
                {renderStars(5)}
                <Text style={styles.reviewText}>odie!!!!</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <CustomBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3c0606ff',
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#290707ff',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#5b1a1aff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  userName: {
    color: '#ffffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userEmail: {
    color: '#d6d6d6ff',
    fontSize: 16,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#510000ff',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    color: '#ffffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    color: '#ed0000ff',
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
    backgroundColor: '#232323ff',
  },
  albumName: {
    color: '#ffffffff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  albumArtist: {
    color: '#d8d8d8ff',
    fontSize: 10,
    textAlign: 'center',
  },
  reviewsList: {
    gap: 12,
  },
  reviewCard: {
    backgroundColor: '#682626ff',
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
    fontSize: 16,
    marginRight: 2,
  },
  starFilled: {
    color: '#FFD700',
  },
  starEmpty: {
    color: '#ddd',
  },
  reviewText: {
    color: '#ffffffff',
    fontSize: 14,
    lineHeight: 18,
  },
  emptySection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
});
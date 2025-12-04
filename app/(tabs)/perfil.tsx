import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { FavoritesService } from '../../services/favoritesService';
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
}

interface FavoriteAlbum {
  id: string;
  album_name: string;
  artist: string;
  album_cover: string;
}

function RatingHistogram({ reviews }: { reviews: Review[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const ratings = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
  const counts = ratings.map((rating) => {
    return reviews.filter((r) => {
      const rounded = Math.round(r.rating * 2) / 2;
      return rounded === rating;
    }).length;
  });
  const maxCount = Math.max(...counts, 1);

  const handleBarPress = (index: number) => {
    if (selectedIndex === index) {
      setSelectedIndex(null);
    } else {
      setSelectedIndex(index);
    }
  };

  const getStarsString = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 !== 0;
    return '★'.repeat(fullStars) + (hasHalf ? '½' : '');
  };

  return (
    <View style={styles.histogramContainer}>
      {selectedIndex === null ? (
        <Text style={styles.histogramSideLabel}>★</Text>
      ) : (
        <View style={styles.histogramSideLabelEmpty} />
      )}
      <View style={styles.histogramBarArea}>
        {ratings.map((rating, i) => (
          <TouchableOpacity 
            key={i} 
            style={styles.histogramBarWrapper}
            onPress={() => handleBarPress(i)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.histogramBar,
                {
                  height: maxCount > 0 ? Math.max((counts[i] / maxCount) * 70, 4) : 4,
                },
                selectedIndex === i && styles.histogramBarSelected,
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.histogramRightLabel}>
        {selectedIndex !== null ? (
          <>
            <Text style={styles.histogramCountText}>{counts[selectedIndex]}</Text>
            <Text style={styles.histogramStarsText}>{getStarsString(ratings[selectedIndex])}</Text>
          </>
        ) : (
          <Text style={styles.histogramSideLabel}>★★★★★</Text>
        )}
      </View>
    </View>
  );
}

export default function PerfilScreen() {
  const router = useRouter();
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [favoriteAlbums, setFavoriteAlbums] = useState<FavoriteAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [favoritesModalVisible, setFavoritesModalVisible] = useState(false);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [selectedFavorites, setSelectedFavorites] = useState<string[]>([]);
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      
      if (session?.user) {
        setNewName(session.user.user_metadata?.name || '');
        setAvatarUrl(session.user.user_metadata?.avatar_url || null);

        // Fazer todas as requisições em paralelo
        const [reviewsResult, allReviewsResult, favoritesData, favoriteIds] = await Promise.all([
          supabase
            .from('resenhas')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false })
            .limit(3),
          supabase
            .from('resenhas')
            .select('*')
            .eq('user_id', session.user.id)
            .order('rating', { ascending: false }),
          FavoritesService.getUserFavorites(session.user.id),
          FavoritesService.getFavoriteIds(session.user.id)
        ]);

        const reviewsData = reviewsResult.data;
        const allReviewsData = allReviewsResult.data;
        
        if (favoritesData.length > 0) {
          setFavoriteAlbums(favoritesData);
          setSelectedFavorites(favoriteIds);
        } else if (allReviewsData && allReviewsData.length > 0) {
          const topRated = allReviewsData.slice(0, 3).map(review => ({
            id: review.id,
            album_name: review.album_name,
            artist: review.artist,
            album_cover: review.album_cover
          }));
          setFavoriteAlbums(topRated);
        }

        setReviews(reviewsData || []);
        setAllReviews(allReviewsData || []);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const shakeScreen = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const toggleFavorite = async (reviewId: string) => {
    if (!user?.id) return;

    console.log('Toggle favorite for review:', reviewId, 'User:', user.id);
    const isCurrentlyFavorite = selectedFavorites.includes(reviewId);
    
    if (isCurrentlyFavorite) {
      console.log('Removing favorite...');
      const success = await FavoritesService.removeFavorite(user.id, reviewId);
      console.log('Remove result:', success);
      if (success) {
        setSelectedFavorites(prev => prev.filter(id => id !== reviewId));
        const updatedFavorites = await FavoritesService.getUserFavorites(user.id);
        setFavoriteAlbums(updatedFavorites);
      }
    } else if (selectedFavorites.length < 3) {
      console.log('Adding favorite...');
      const success = await FavoritesService.addFavorite(user.id, reviewId);
      console.log('Add result:', success);
      if (success) {
        setSelectedFavorites(prev => [...prev, reviewId]);
        const updatedFavorites = await FavoritesService.getUserFavorites(user.id);
        setFavoriteAlbums(updatedFavorites);
      }
    } else {
      shakeScreen();
    }
  };

  const saveFavorites = async () => {
    try {
      if (!user?.id) return;

      const favoritesData = await FavoritesService.getUserFavorites(user.id);
      setFavoriteAlbums(favoritesData);
      setFavoritesModalVisible(false);
    } catch (error: any) {
      console.error('Erro ao salvar favoritos:', error);
    }
  };



  const renderFavoriteAlbum = ({ item }: { item: FavoriteAlbum }) => (
    <View style={styles.favoriteAlbum}>
      <Image
        source={{ uri: item.album_cover || 'https://via.placeholder.com/80' }}
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
      <StarRating rating={item.rating} size={18} />
      <Text style={styles.reviewText} numberOfLines={2}>
        {item.review_text || 'Remarks'}
      </Text>
    </View>
  );

  const getUserName = () => {
    return user?.user_metadata?.name || user?.email?.split('@')[0] || 'Billy';
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso às suas fotos!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      uploadAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (uri: string) => {
    try {
      setUploading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        Alert.alert('Erro', 'Você precisa estar logado');
        return;
      }

      const ext = uri.split('.').pop() || 'jpg';
      const fileName = `${session.user.id}-${Date.now()}.${ext}`;
      const filePath = `${session.user.id}/${fileName}`;

      console.log('Fazendo upload para:', filePath);

      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();

      console.log('ArrayBuffer criado, tamanho:', arrayBuffer.byteLength);

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, arrayBuffer, {
          contentType: `image/${ext}`,
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Erro no upload:', error);
        throw error;
      }

      console.log('Upload bem-sucedido:', data);

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log('URL pública:', publicUrl);
      setAvatarUrl(publicUrl);
      
    } catch (error: any) {
      console.error('Erro completo ao fazer upload:', error);
      Alert.alert('Erro', error?.message || 'Não foi possível fazer upload da imagem');
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = () => {
    Alert.alert(
      'Remover foto',
      'Tem certeza que deseja remover sua foto de perfil?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            setAvatarUrl(null);
          }
        }
      ]
    );
  };

  const saveProfile = async () => {
    try {
      setUploading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const updates = {
        data: {
          name: newName,
          avatar_url: avatarUrl,
        }
      };

      const { error } = await supabase.auth.updateUser(updates);
      
      if (error) throw error;

      await fetchUserData();
      setEditModalVisible(false);
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações');
    } finally {
      setUploading(false);
    }
  };

  const averageRating =
    allReviews.length > 0
      ? (
          allReviews.reduce((sum, review) => sum + (review.rating || 0), 0) /
          allReviews.length
        ).toFixed(2)
      : null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Perfil</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Feather name="x" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.avatarEditContainer}>
              <TouchableOpacity 
                onPress={pickImage}
                disabled={uploading}
                style={styles.avatarTouchable}
              >
                {uploading ? (
                  <ActivityIndicator size="large" color="#ed0000ff" />
                ) : avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={styles.avatarEditImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Feather name="camera" size={30} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
              
              <View style={styles.photoActions}>
                <TouchableOpacity onPress={pickImage} disabled={uploading}>
                  <Text style={styles.changePhotoText}>
                    {avatarUrl ? 'Trocar foto' : 'Adicionar foto'}
                  </Text>
                </TouchableOpacity>
                {avatarUrl && (
                  <>
                    <Text style={styles.photoSeparator}> • </Text>
                    <TouchableOpacity onPress={removeAvatar} disabled={uploading}>
                      <Text style={styles.removePhotoText}>Remover</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nome</Text>
              <TextInput
                style={styles.input}
                value={newName}
                onChangeText={setNewName}
                placeholder="Seu nome"
                placeholderTextColor="#999"
              />
            </View>

            <TouchableOpacity 
              style={[styles.saveButton, uploading && styles.saveButtonDisabled]}
              onPress={saveProfile}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Salvar alterações</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#FFFFFF']}
            tintColor="#FFFFFF"
          />
        }
      >
        <View style={styles.profileHeaderContainer}>
          <View style={styles.profileHeaderBackground} />
          <View style={styles.profileHeader}>
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => navigation.openDrawer()}
            >
              <Feather name="menu" size={24} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => setEditModalVisible(true)}
            >
              <Feather name="edit-2" size={20} color="#fff" />
            </TouchableOpacity>
            
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarContainer}>
                <Feather name="user" size={40} color="#fff" />
              </View>
            )}
            <Text style={styles.userName}>{getUserName()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Álbuns Favoritos</Text>
            <View style={{ flexDirection: 'row', gap: 15 }}>
              <TouchableOpacity onPress={() => setFavoritesModalVisible(true)}>
                <Feather name="edit-2" size={18} color="#ed0000ff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/(tabs)/minhas-resenhas')}>
                <Text style={styles.seeAllText}>Ver todos</Text>
              </TouchableOpacity>
            </View>
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
            <View style={styles.emptyFavorites}>
              <Feather name="heart" size={40} color="#666" />
              <Text style={styles.emptyText}>Nenhum álbum favorito selecionado</Text>
              <TouchableOpacity 
                style={styles.selectButton}
                onPress={() => setFavoritesModalVisible(true)}
              >
                <Text style={styles.selectButtonText}>Selecionar Favoritos</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.averageRatingContainer}>
            <Text style={styles.averageRatingLabel}>Média das notas:</Text>
            <Text style={styles.averageRatingValue}>
              {averageRating !== null ? `${averageRating} / 5` : '—'}
            </Text>
          </View>

          <View style={styles.ratingHistogramContainer}>
            <Text style={styles.histogramTitle}>Frequência de Avaliações por Estrelas</Text>
            <RatingHistogram reviews={allReviews} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Avaliações recentes</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/minhas-resenhas')}>
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
                <StarRating rating={5} size={18} />
                <Text style={styles.reviewText}>odie!!!!</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={favoritesModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFavoritesModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.favoritesModalContent,
              { transform: [{ translateX: shakeAnimation }] }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione seus Favoritos</Text>
              <TouchableOpacity onPress={() => setFavoritesModalVisible(false)}>
                <Feather name="x" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>
              Escolha até 3 álbuns ({selectedFavorites.length}/3)
            </Text>

            <ScrollView style={styles.reviewsSelectionList}>
              {allReviews.map((review) => (
                <TouchableOpacity
                  key={review.id}
                  style={[
                    styles.reviewSelectionItem,
                    selectedFavorites.includes(review.id) && styles.reviewSelectionItemSelected
                  ]}
                  onPress={() => toggleFavorite(review.id)}
                >
                  <Image 
                    source={{ uri: review.album_cover || 'https://via.placeholder.com/60' }} 
                    style={styles.reviewSelectionCover}
                  />
                  <View style={styles.reviewSelectionInfo}>
                    <Text style={styles.reviewSelectionAlbum}>{review.album_name}</Text>
                    <Text style={styles.reviewSelectionArtist}>{review.artist}</Text>
                    <View style={styles.ratingContainer}>
                      <StarRating rating={review.rating} size={16} />
                    </View>
                  </View>
                  {selectedFavorites.includes(review.id) && (
                    <Feather name="check-circle" size={24} color="#ed0000ff" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity 
              style={styles.saveButton}
              onPress={saveFavorites}
            >
              <Text style={styles.saveButtonText}>Salvar Favoritos</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3c0606ff',
  },
  ratingHistogramContainer: {
    marginTop: 20,
    marginBottom: 10,
    alignItems: 'center',
    backgroundColor: '#4a1515',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 12,
  },
  histogramTitle: {
    color: '#d4a5a5',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 25,
    textAlign: 'center',
  },
  histogramContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    width: '100%',
    paddingBottom: 7,
  },
  histogramSideLabel: {
    color: '#d4a5a5',
    fontSize: 11,
    paddingBottom: 2,
    minWidth: 40,
    textAlign: 'center',
  },
  histogramBarArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    flex: 1,
    height: 80,
    marginHorizontal: 15,
    gap: 3,
  },
  histogramBarWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  histogramBar: {
    width: 22,
    borderRadius: 2,
    backgroundColor: '#d4a5a5',
  },
  histogramBarSelected: {
    backgroundColor: '#8b2020',
  },
  histogramSideLabelEmpty: {
    minWidth: 40,
  },
  histogramRightLabel: {
    minWidth: 50,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    paddingBottom: 2,
  },
  histogramCountText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  histogramStarsText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  averageRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    marginBottom: 5,
    gap: 8,
  },
  averageRatingLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginRight: 6,
  },
  averageRatingValue: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  profileHeaderContainer: {
    position: 'relative',
    backgroundColor: '#3c0606ff',
  },
  profileHeaderBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    backgroundColor: '#1a0404ff',
    zIndex: 0,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
    position: 'relative',
    zIndex: 1,
  },
  menuButton: {
    position: 'absolute',
    top: 35,
    left: 20,
    backgroundColor: '#682626ff',
    padding: 10,
    borderRadius: 20,
    zIndex: 1,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#5b1a1aff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 4,
    borderColor: '#3c0606ff',
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
    borderBottomColor: '#5a0a0aff',
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
    backgroundColor: '#4a1010ff',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#b30000',
    gap: 8,
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
  editButton: {
    position: 'absolute',
    top: 35,
    right: 20,
    backgroundColor: '#682626ff',
    padding: 10,
    borderRadius: 20,
    zIndex: 1,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderWidth: 4,
    borderColor: '#3c0606ff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#290707ff',
    borderRadius: 15,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  avatarEditContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarTouchable: {
    marginBottom: 10,
  },
  photoActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoSeparator: {
    color: '#999',
    marginHorizontal: 8,
  },
  removePhotoText: {
    color: '#ff4444',
    fontSize: 14,
    fontWeight: '600',
  },
  avatarEditImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#5b1a1aff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  changePhotoText: {
    color: '#ed0000ff',
    fontSize: 14,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#682626ff',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#ed0000ff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyFavorites: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
    marginTop: 10,
    marginBottom: 15,
  },
  selectButton: {
    backgroundColor: '#ed0000ff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  favoritesModalContent: {
    backgroundColor: '#3c0606ff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalSubtitle: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
  },
  reviewsSelectionList: {
    maxHeight: 400,
  },
  reviewSelectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5a0a0aff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  reviewSelectionItemSelected: {
    borderColor: '#ed0000ff',
    backgroundColor: '#682626ff',
  },
  reviewSelectionCover: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  reviewSelectionInfo: {
    flex: 1,
  },
  reviewSelectionAlbum: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  reviewSelectionArtist: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
  },
});
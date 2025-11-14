import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
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
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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
      }

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

      // Buscar a imagem como ArrayBuffer (funciona no React Native)
      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();

      console.log('ArrayBuffer criado, tamanho:', arrayBuffer.byteLength);

      // Upload usando ArrayBuffer
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

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log('URL pública:', publicUrl);
      setAvatarUrl(publicUrl);
      
      Alert.alert('Sucesso', 'Foto atualizada!');
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
            Alert.alert('Sucesso', 'Foto removida! Lembre-se de salvar as alterações.');
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
      Alert.alert('Sucesso', 'Perfil atualizado!');
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações');
    } finally {
      setUploading(false);
    }
  };

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

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeaderContainer}>
          <View style={styles.profileHeaderBackground} />
          <View style={styles.profileHeader}>
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
            <TouchableOpacity onPress={() => router.push('/minhas-resenhas')}>
              <Text style={styles.seeAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={favoriteAlbums.length > 0 ? favoriteAlbums : [
              { id: '1', album_name: 'Thriller', artist: 'Michael Jackson', cover_url: 'https://via.placeholder.com/80' },
              { id: '2', album_name: 'La Última Misión', artist: 'Wisin & Yandel', cover_url: 'https://via.placeholder.com/80' },
              { id: '3', album_name: 'Exatamente Agora', artist: 'Bruno & Marrone', cover_url: 'https://via.placeholder.com/80' }
            ]}
            renderItem={renderFavoriteAlbum}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.favoritesList}
          />
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
  editButton: {
    position: 'absolute',
    top: 20,
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
});
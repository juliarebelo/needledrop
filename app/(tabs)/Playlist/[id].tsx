import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList, Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../../../services/supabase';

const PLAYLIST_DEFAULT_IMAGE = require('../../../assets/images/playlist_cover.jpg');

interface Musica {
  id: string;
  title: string | null;
  artist: string;
  album: string | null;
  album_cover: string | null;
}

interface Playlist {
  id: string;
  titulo: string;
  capaUrl: string;
  musicas: Musica[];
}

export default function PlaylistDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Musica[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadPlaylist();
    }, [id])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPlaylist();
    setRefreshing(false);
  }, [id]);

  useEffect(() => {
    loadPlaylist();
  }, [id]);

  const loadPlaylist = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        Alert.alert('Erro', 'Você precisa estar logado');
        router.replace('/(tabs)/homepage');
        return;
      }

      const { data: playlistData, error: playlistError } = await supabase
        .from('playlists')
        .select('id, titulo, capa_url')
        .eq('id', id)
        .eq('user_id', session.user.id)
        .single();

      if (playlistError) {
        console.error('Erro ao buscar playlist:', playlistError);
        Alert.alert('Erro', 'Playlist não encontrada');
        router.replace('/(tabs)/homepage');
        return;
      }

      const { data: musicasData, error: musicasError } = await supabase
  .from('playlist_musicas')
  .select(`
    song_id,
    musicas (id, title, artist, album, album_cover)`)
  .eq('playlist_id', id)
  .order('position', { ascending: true });

const musicas = (musicasData || []).map((item: any) => ({
  id: item.musicas.id,
  title: item.musicas.title,
  artist: item.musicas.artist,
  album: item.musicas.album,
  album_cover: item.musicas.album_cover
}));

      const isOldDefault = playlistData.capa_url?.includes('unsplash.com/photo-1493225457124');
      
      setPlaylist({
        id: playlistData.id,
        titulo: playlistData.titulo,
        capaUrl: (playlistData.capa_url && !isOldDefault) ? playlistData.capa_url : '',
        musicas: musicas
      });
    } catch (error) {
      console.error('Erro ao carregar playlist:', error);
      Alert.alert('Erro', 'Não foi possível carregar a playlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const buscarMusicas = async () => {
      if (searchQuery.length > 0) {
        try {
          const { data, error } = await supabase
  .from('musicas')
  .select('id, title, artist, album, album_cover')
  .or(`title.ilike.%${searchQuery}%,artist.ilike.%${searchQuery}%,album.ilike.%${searchQuery}%`)
  .limit(5);

          if (error) {
            console.error('Erro na busca:', error);
            setSearchResults([]);
          } else {
            setSearchResults(data || []);
          }
        } catch (error) {
          console.error('Erro na busca:', error);
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
      }
    };

    buscarMusicas();
  }, [searchQuery]);

  const adicionarMusica = async (musica: Musica) => {
    if (playlist && !playlist.musicas.some(m => m.id === musica.id)) {
      try {
        const { error } = await supabase
          .from('playlist_musicas')
          .insert({
            playlist_id: id,
            song_id: musica.id,
            position: playlist.musicas.length
          });

        if (error) {
          console.error('Erro detalhado:', error);
          throw error;
        }

        const updatedPlaylist = {
          ...playlist,
          musicas: [...playlist.musicas, musica]
        };
        setPlaylist(updatedPlaylist);
        setSearchQuery('');
        setShowSearch(false);
      } catch (error: any) {
        console.error('Erro ao adicionar música:', error);
        Alert.alert('Erro', `Não foi possível adicionar a música: ${error?.message || 'Erro desconhecido'}`);
      }
    } else {
      Alert.alert('Aviso', 'Esta música já está na playlist');
    }
  };

  const removerMusica = (musicaId: string) => {
    if (playlist) {
      Alert.alert(
        'Remover Música',
        'Tem certeza que deseja remover esta música da playlist?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Remover',
            style: 'destructive',
            onPress: async () => {
              try {
                const { error } = await supabase
                  .from('playlist_musicas')
                  .delete()
                  .eq('playlist_id', id)
                  .eq('song_id', musicaId);

                if (error) throw error;

                const updatedPlaylist = {
                  ...playlist,
                  musicas: playlist.musicas.filter(musica => musica.id !== musicaId)
                };
                setPlaylist(updatedPlaylist);
              } catch (error) {
                console.error('Erro ao remover música:', error);
                Alert.alert('Erro', 'Não foi possível remover a música');
              }
            }
          }
        ]
      );
    }
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
      uploadPlaylistCover(result.assets[0].uri);
    }
  };

  const uploadPlaylistCover = async (uri: string) => {
    try {
      setUploading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        Alert.alert('Erro', 'Você precisa estar logado');
        return;
      }

      const ext = uri.split('.').pop() || 'jpg';
      const fileName = `playlist-${id}-${Date.now()}.${ext}`;
      const filePath = `${session.user.id}/playlists/${fileName}`;

      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();

      const { data, error } = await supabase.storage
        .from('playlist_covers')
        .upload(filePath, arrayBuffer, {
          contentType: `image/${ext}`,
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('playlist_covers')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('playlists')
        .update({ capa_url: publicUrl })
        .eq('id', id);

      if (updateError) throw updateError;

      if (playlist) {
        setPlaylist({ ...playlist, capaUrl: publicUrl });
        setEditModalVisible(false);
      }
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      Alert.alert('Erro', error?.message || 'Não foi possível fazer upload da imagem');
    } finally {
      setUploading(false);
    }
  };

  const removePlaylistCover = () => {
    Alert.alert(
      'Remover capa',
      'Deseja voltar para a capa padrão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            if (playlist) {
              try {
                await supabase
                  .from('playlists')
                  .update({ capa_url: null })
                  .eq('id', id);
                
                setPlaylist({
                  ...playlist,
                  capaUrl: ''
                });
              } catch (error) {
                console.error('Erro ao restaurar capa:', error);
                Alert.alert('Erro', 'Não foi possível restaurar a capa padrão');
              }
            }
          }
        }
      ]
    );
  };

  if (loading || !playlist) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FFFFFF" style={{ marginTop: 100 }} />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Capa da Playlist</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Feather name="x" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.coverEditContainer}>
              <TouchableOpacity 
                onPress={pickImage}
                disabled={uploading}
                style={styles.coverTouchable}
              >
                {uploading ? (
                  <ActivityIndicator size="large" color="#ed0000ff" />
                ) : (
                  <Image source={playlist?.capaUrl ? { uri: playlist.capaUrl } : PLAYLIST_DEFAULT_IMAGE} style={styles.coverEditImage} />
                )}
              </TouchableOpacity>
              
              <View style={styles.coverActions}>
                <TouchableOpacity onPress={pickImage} disabled={uploading}>
                  <Text style={styles.changeCoverText}>Trocar capa</Text>
                </TouchableOpacity>
                <Text style={styles.coverSeparator}> • </Text>
                <TouchableOpacity onPress={removePlaylistCover} disabled={uploading}>
                  <Text style={styles.removeCoverText}>Usar padrão</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.closeButton, uploading && styles.closeButtonDisabled]}
              onPress={() => setEditModalVisible(false)}
              disabled={uploading}
            >
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#FFFFFF']}
            tintColor="#FFFFFF"
          />
        }
      >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/homepage')}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{playlist.titulo}</Text>
        <TouchableOpacity onPress={() => setShowSearch(!showSearch)}>
          <Feather name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.playlistHeader}>
        <TouchableOpacity onPress={() => setEditModalVisible(true)} style={styles.capaContainer}>
          <Image source={playlist.capaUrl ? { uri: playlist.capaUrl } : PLAYLIST_DEFAULT_IMAGE} style={styles.playlistCapa} />
          <View style={styles.editCoverOverlay}>
            <Feather name="camera" size={24} color="#fff" />
          </View>
        </TouchableOpacity>
        <View style={styles.playlistInfo}>
          <Text style={styles.playlistTitulo}>{playlist.titulo}</Text>
          <Text style={styles.playlistCount}>
            {playlist.musicas.length} {playlist.musicas.length === 1 ? 'música' : 'músicas'}
          </Text>
        </View>
      </View>

      {showSearch && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar músicas..."
            placeholderTextColor="#aaa"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={true}
          />
          <TouchableOpacity onPress={() => setShowSearch(false)}>
            <Feather name="x" size={20} color="#aaa" />
          </TouchableOpacity>
        </View>
      )}

      {showSearch && searchResults.length > 0 && (
        <View style={styles.searchResults}>
          <Text style={styles.sectionTitle}>Resultados da Busca</Text>
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.searchResultItem}
                onPress={() => adicionarMusica(item)}
              >
                <Image source={{ uri: item.album_cover || 'https://via.placeholder.com/150' }} style={styles.albumImage} />
                <View style={styles.albumInfo}>
                  <Text style={styles.albumTitle}>{item.album || item.title || 'Sem título'}</Text>
                  <Text style={styles.albumArtist}>{item.artist}</Text>
                </View>
                <Feather name="plus" size={20} color="#1DB954" />
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      <View style={styles.musicasSection}>
        <Text style={styles.sectionTitle}>
          Músicas na Playlist ({playlist.musicas.length})
        </Text>
        
        {playlist.musicas.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="music" size={50} color="#666" />
            <Text style={styles.emptyText}>Nenhuma música nesta playlist</Text>
            <Text style={styles.emptySubtext}>
              Toque no + para adicionar músicas
            </Text>
          </View>
        ) : (
          <FlatList
            data={playlist.musicas}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.playlistMusicaItem}>
                <Image source={{ uri: item.album_cover || 'https://via.placeholder.com/150' }} style={styles.albumImage} />
                <View style={styles.albumInfo}>
                  <Text style={styles.albumTitle}>{item.album || item.title || 'Sem título'}</Text>
                  <Text style={styles.albumArtist}>{item.artist}</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => removerMusica(item.id)}
                  style={styles.removeButton}
                >
                  <Feather name="trash-2" size={18} color="#FF4444" />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
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
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  playlistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  playlistCapa: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 15,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistTitulo: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  playlistCount: {
    color: '#ccc',
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4a1e1e',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: '#fff',
    fontSize: 16,
  },
  searchResults: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4a1e1e',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  playlistMusicaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4a1e1e',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  albumImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 12,
  },
  albumInfo: {
    flex: 1,
  },
  albumTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  albumArtist: {
    color: '#ccc',
    fontSize: 14,
  },
  removeButton: {
    padding: 8,
  },
  musicasSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#ccc',
    fontSize: 18,
    marginTop: 15,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#888',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
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
  coverEditContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  coverTouchable: {
    marginBottom: 10,
  },
  coverEditImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
  },
  coverActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeCoverText: {
    color: '#ed0000ff',
    fontSize: 14,
    fontWeight: '600',
  },
  coverSeparator: {
    color: '#999',
    marginHorizontal: 8,
  },
  removeCoverText: {
    color: '#ff4444',
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#ed0000ff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonDisabled: {
    opacity: 0.5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  capaContainer: {
    position: 'relative',
  },
  editCoverOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 20,
    padding: 8,
  },
});
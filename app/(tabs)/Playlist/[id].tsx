import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList, Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Album, mockAlbuns } from '../../../data/mockData';

interface Playlist {
  id: string;
  titulo: string;
  capaUrl: string;
  albuns: Album[];
}

export default function PlaylistDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Album[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    // Mock data - depois substitua por dados reais
    const mockPlaylist: Playlist = {
      id: id as string,
      titulo: 'Minha Playlist',
      capaUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop',
      albuns: [] // CORREÇÃO: removida a barra extra
    };
    setPlaylist(mockPlaylist);
  }, [id]);

  // Buscar álbuns
  useEffect(() => {
    if (searchQuery.length > 0) {
      const results = mockAlbuns.filter(album =>
        album.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        album.artista.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Adicionar álbum à playlist
  const adicionarAlbum = (album: Album) => {
    if (playlist && !playlist.albuns.some(a => a.id === album.id)) {
      const updatedPlaylist = {
        ...playlist,
        albuns: [...playlist.albuns, album]
      };
      setPlaylist(updatedPlaylist);
      setSearchQuery('');
      setShowSearch(false);
      Alert.alert('Sucesso!', `${album.titulo} adicionado à playlist`);
    } else {
      Alert.alert('Aviso', 'Este álbum já está na playlist');
    }
  };

  // Remover álbum da playlist
  const removerAlbum = (albumId: string) => {
    if (playlist) {
      Alert.alert(
        'Remover Álbum',
        'Tem certeza que deseja remover este álbum da playlist?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Remover',
            style: 'destructive',
            onPress: () => {
              const updatedPlaylist = {
                ...playlist,
                albuns: playlist.albuns.filter(album => album.id !== albumId)
              };
              setPlaylist(updatedPlaylist);
            }
          }
        ]
      );
    }
  };

  if (!playlist) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{playlist.titulo}</Text>
        <TouchableOpacity onPress={() => setShowSearch(!showSearch)}>
          <Feather name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Capa da Playlist */}
      <View style={styles.playlistHeader}>
        <Image source={{ uri: playlist.capaUrl }} style={styles.playlistCapa} />
        <View style={styles.playlistInfo}>
          <Text style={styles.playlistTitulo}>{playlist.titulo}</Text>
          <Text style={styles.playlistCount}>
            {playlist.albuns.length} {playlist.albuns.length === 1 ? 'álbum' : 'álbuns'}
          </Text>
        </View>
      </View>

      {/* Barra de Pesquisa (aparece quando clicar em +) */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar álbuns..."
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

      {/* Resultados da Busca */}
      {showSearch && searchResults.length > 0 && (
        <View style={styles.searchResults}>
          <Text style={styles.sectionTitle}>Resultados da Busca</Text>
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.searchResultItem}
                onPress={() => adicionarAlbum(item)}
              >
                <Image source={{ uri: item.capaUrl }} style={styles.albumImage} />
                <View style={styles.albumInfo}>
                  <Text style={styles.albumTitle}>{item.titulo}</Text>
                  <Text style={styles.albumArtist}>{item.artista}</Text>
                </View>
                <Feather name="plus" size={20} color="#1DB954" />
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Álbuns da Playlist */}
      <View style={styles.albunsSection}>
        <Text style={styles.sectionTitle}>
          Álbuns na Playlist ({playlist.albuns.length})
        </Text>
        
        {playlist.albuns.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="music" size={50} color="#666" />
            <Text style={styles.emptyText}>Nenhum álbum nesta playlist</Text>
            <Text style={styles.emptySubtext}>
              Toque no + para adicionar álbuns
            </Text>
          </View>
        ) : (
          <FlatList
            data={playlist.albuns}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.playlistAlbumItem}>
                <Image source={{ uri: item.capaUrl }} style={styles.albumImage} />
                <View style={styles.albumInfo}>
                  <Text style={styles.albumTitle}>{item.titulo}</Text>
                  <Text style={styles.albumArtist}>{item.artista}</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => removerAlbum(item.id)}
                  style={styles.removeButton}
                >
                  <Feather name="trash-2" size={18} color="#FF4444" />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
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
  playlistAlbumItem: {
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
  albunsSection: {
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
});
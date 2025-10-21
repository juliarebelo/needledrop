import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList, Image,
  Modal,
  ScrollView, StatusBar, StyleSheet, Text,
  TextInput,
  TouchableOpacity, View
} from 'react-native';
import { supabase } from '../../services/supabase';

interface Usuario {
  id: string;
  nome: string;
  fotoUrl: string;
}

interface Playlist {
  id: string;
  titulo: string;
  capaUrl: string;
}

interface Album {
  id: string;
  titulo: string;
  artista: string;
  capaUrl: string;
}

const API_BASE_URL = 'http://192.168.0.5:3000';

const Header = ({ usuario }: { usuario: Usuario | null }) => {
  const router = useRouter(); 

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => alert('Abrir menu lateral!')}>
        <Feather name="menu" size={32} color="#FFFFFF" />
      </TouchableOpacity>
      <Text style={styles.greeting}>Olá, {usuario?.nome || 'Usuário'}!</Text>
      <TouchableOpacity onPress={() => router.push('/(tabs)/perfil')}>
        <Image
          source={{ uri: usuario?.fotoUrl || 'https://via.placeholder.com/150' }}
          style={styles.avatar}
        />
      </TouchableOpacity>
    </View>
  );
};

const PlaylistCard = ({ item, onDelete, onPress }: { 
  item: Playlist; 
  onDelete: (id: string) => void;
  onPress: (id: string) => void;
}) => (
  <View style={styles.playlistCardContainer}>
    <TouchableOpacity style={styles.playlistCard} onPress={() => onPress(item.id)}>
      <Image source={{ uri: item.capaUrl || 'https://via.placeholder.com/150' }} style={styles.playlistImage} />
      <Text style={styles.playlistTitle}>{item.titulo}</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.deleteButton}>
      <Feather name="x" size={20} color="#FF0000" />
    </TouchableOpacity>
  </View>
);

const AlbumListItem = ({ item, isFavorito, onToggleFavorito }: { item: Album; isFavorito: boolean; onToggleFavorito: (id: string) => void }) => (
  <TouchableOpacity style={styles.albumItem}>
    <Image source={{ uri: item.capaUrl || 'https://via.placeholder.com/150' }} style={styles.albumImage} />
    <View style={styles.albumTextContainer}>
      <Text style={styles.albumTitle}>{item.titulo}</Text>
      <Text style={styles.albumArtist}>{item.artista}</Text>
    </View>
    <TouchableOpacity onPress={() => onToggleFavorito(item.id)} style={styles.favoriteButton}>
      <Feather name={isFavorito ? "heart" : "heart"} size={24} color={isFavorito ? "#FF0000" : "#FFFFFF"} />
    </TouchableOpacity>
  </TouchableOpacity>
);

const CustomBottomNav = () => {
  const router = useRouter(); 

  return (
    <View style={styles.navContainer}>
      <TouchableOpacity onPress={() => router.push('/(tabs)/homepage')}>
        <Image source={require('../../assets/images/home.png')} style={styles.navIcon} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/(tabs)/busca')}>
        <Image source={require('../../assets/images/search.png')} style={styles.navIcon} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/(tabs)/perfil')}>
        <Image source={require('../../assets/images/user.png')} style={styles.navIcon} />
      </TouchableOpacity>
    </View>
  );
};

export default function Homepage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [albuns, setAlbuns] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [novaPlaylistTitulo, setNovaPlaylistTitulo] = useState('');

  // FUNÇÃO EXCLUIR PLAYLIST
  const excluirPlaylist = (playlistId: string) => {
    Alert.alert(
      "Excluir Playlist",
      "Tem certeza que deseja excluir esta playlist?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", 
          style: "destructive",
          onPress: () => {
            setPlaylists(playlists.filter(playlist => playlist.id !== playlistId));
            Alert.alert('Sucesso', 'Playlist excluída!');
          }
        }
      ]
    );
  };

  const criarPlaylist = () => {
    if (novaPlaylistTitulo.trim() === '') {
      Alert.alert('Erro', 'Digite um nome para a playlist');
      return;
    }

    const novaPlaylist: Playlist = {
      id: Date.now().toString(),
      titulo: novaPlaylistTitulo,
      capaUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop'
    };

    setPlaylists([...playlists, novaPlaylist]);
    setNovaPlaylistTitulo('');
    setModalVisible(false);
    Alert.alert('Sucesso', `Playlist "${novaPlaylistTitulo}" criada!`);
  };

  const toggleFavorito = (albumId: string) => {
    setFavoritos(prev => 
      prev.includes(albumId) 
        ? prev.filter(id => id !== albumId)
        : [...prev, albumId]
    );
  };

  // BUSCAR ÁLBUNS ÚNICOS DO SUPABASE
  const buscarAlbunsUnicos = async (): Promise<Album[]> => {
    try {
      // Busca álbuns distintos da tabela musicas
      const { data: musicasData, error } = await supabase
        .from('musicas')
        .select('id, artist, album, url_capa')
        .not('album', 'is', null) // Só álbuns com nome
        .order('views', { ascending: false }) // Ordena por views (mais populares)
        .limit(50); // Busca mais para depois filtrar únicos

      if (error) {
        console.error('Erro ao buscar álbuns:', error);
        return [];
      }

      // Filtra álbuns únicos (não repete mesmo artista + mesmo álbum)
      const albunsUnicos: Album[] = [];
      const albunsVistos = new Set<string>();

      musicasData.forEach(musica => {
        const chaveUnica = `${musica.artist.toLowerCase()}-${musica.album.toLowerCase()}`;
        
        if (!albunsVistos.has(chaveUnica)) {
          albunsVistos.add(chaveUnica);
          albunsUnicos.push({
            id: musica.id,
            titulo: musica.album,
            artista: musica.artist,
            capaUrl: musica.url_capa || 'https://via.placeholder.com/150'
          });
        }
      });

      return albunsUnicos.slice(0, 20); // Retorna no máximo 20 álbuns únicos

    } catch (error) {
      console.error('Erro na busca de álbuns:', error);
      return [];
    }
  };

  const AddPlaylistCard = () => (
    <TouchableOpacity 
      style={[styles.playlistCard, styles.addCard]} 
      onPress={() => setModalVisible(true)}
    >
      <Feather name="plus" size={30} color="#FFFFFF" />
    </TouchableOpacity>
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Busca dados em paralelo
        const [albunsData, usuarioRes, playlistsRes] = await Promise.all([
          buscarAlbunsUnicos(),
          fetch(`${API_BASE_URL}/api/usuarios/me`),
          fetch(`${API_BASE_URL}/api/me/playlists`),
        ]);

        // Define os álbuns do Supabase
        setAlbuns(albunsData);

        // Usuário e playlists (mantém da API por enquanto)
        if (usuarioRes.ok) {
          const usuarioData: Usuario = await usuarioRes.json();
          setUsuario(usuarioData);
        }

        if (playlistsRes.ok) {
          const playlistsData: Playlist[] = await playlistsRes.json();
          setPlaylists(playlistsData);
        }

      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        
        // Fallback em caso de erro
        try {
          const fallbackRes = await fetch(`${API_BASE_URL}/api/recomendacoes`);
          if (fallbackRes.ok) {
            const fallbackData: Album[] = await fallbackRes.json();
            setAlbuns(fallbackData);
          }
        } catch (fallbackError) {
          console.error('Erro no fallback:', fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#FFFFFF" /></View>;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nova Playlist</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nome da playlist"
              placeholderTextColor="#aaa"
              value={novaPlaylistTitulo}
              onChangeText={setNovaPlaylistTitulo}
              autoFocus={true}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.createButton]} 
                onPress={criarPlaylist}
              >
                <Text style={styles.modalButtonText}>Criar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <Header usuario={usuario} />
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Minhas Playlists</Text>
          <FlatList
            data={playlists}
            renderItem={({ item }) => (
              <PlaylistCard 
                item={item} 
                onDelete={excluirPlaylist}
                onPress={(id) => router.push(`/(tabs)/Playlist/${id}`)}
              />
            )}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            ListFooterComponent={<AddPlaylistCard />}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Álbuns em Destaque</Text>
          {albuns.map(item => (
            <AlbumListItem 
              key={item.id} 
              item={item} 
              isFavorito={favoritos.includes(item.id)}
              onToggleFavorito={toggleFavorito}
            />
          ))}
        </View>
      </ScrollView>

      <CustomBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#300505',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#300505',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },

  playlistCardContainer: {
    position: 'relative',
    width: 140,
    marginRight: 15,
  },
  playlistCard: {
    width: 140,
  },
  playlistImage: {
    width: 140,
    height: 140,
    borderRadius: 10,
  },
  playlistTitle: {
    color: '#ccc',
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },

  deleteButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCard: {
    backgroundColor: '#4a1e1e',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 70,
    width: 140,
    height: 140,
  },
  albumItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  albumImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
    marginRight: 15,
  },
  albumTextContainer: { 
    flex: 1,
    marginLeft: 15 
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
  favoriteButton: {
    padding: 8,
  },
  navContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(42, 12, 12, 0.9)',
    borderRadius: 30,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#555',
  },
  navIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    backgroundColor: '#300505',
    padding: 20,
    borderRadius: 15,
    width: '80%',
    borderWidth: 1,
    borderColor: '#555',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#4a1e1e',
    borderRadius: 8,
    padding: 15,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  createButton: {
    backgroundColor: '#1DB954',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList, Image,
    Modal,
    RefreshControl,
    ScrollView, StatusBar, StyleSheet, Text,
    TextInput,
    TouchableOpacity, View
} from 'react-native';
import { theme } from '../../constants/theme';
import { RecomendacaoService } from '../../services/recomendacaoService';
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

const Header = ({ usuario }: { usuario: Usuario | null }) => {
  const router = useRouter();
  const navigation = useNavigation<any>();

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.openDrawer()}>
        <Feather name="menu" size={32} color={theme.colors.text} />
      </TouchableOpacity>
      <Text style={styles.greeting}>Olá, {usuario?.nome.trim()}!</Text>
      <TouchableOpacity onPress={() => router.push('/(tabs)/perfil')}>
        <Image
          source={{ uri: usuario?.fotoUrl || 'https://via.placeholder.com/150' }}
          style={styles.avatar}
        />
      </TouchableOpacity>
    </View>
  );
};

const PlaylistCard = React.memo(({ item, onDelete, onPress }: { 
  item: Playlist; 
  onDelete: (id: string) => void;
  onPress: (id: string) => void;
}) => (
  <View style={styles.playlistCardContainer}>
    <TouchableOpacity style={styles.playlistCard} onPress={() => onPress(item.id)}>
      <Image 
        source={{ uri: item.capaUrl || 'https://via.placeholder.com/150' }} 
        style={styles.playlistImage}
        resizeMode="cover"
      />
      <Text style={styles.playlistTitle} numberOfLines={2}>{item.titulo}</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.deleteButton}>
      <Feather name="x" size={20} color="#FF0000" />
    </TouchableOpacity>
  </View>
));

const AlbumListItem = React.memo(({ item, isFavorito, onToggleFavorito, onPress }: { 
  item: Album; 
  isFavorito: boolean; 
  onToggleFavorito: (id: string) => void;
  onPress: (item: Album) => void;
}) => {
  console.log('Renderizando álbum:', item.titulo, 'Capa URL:', item.capaUrl);
  
  return (
    <TouchableOpacity style={styles.albumItem} onPress={() => onPress(item)}>
      <Image 
        source={{ uri: item.capaUrl || 'https://via.placeholder.com/150' }} 
        style={styles.albumImage}
        resizeMode="cover"
        onError={(error) => console.log('Erro ao carregar imagem:', item.titulo, error.nativeEvent)}
        onLoad={() => console.log('Imagem carregada:', item.titulo)}
      />
      <View style={styles.albumTextContainer}>
        <Text style={styles.albumTitle} numberOfLines={1}>{item.titulo}</Text>
        <Text style={styles.albumArtist} numberOfLines={1}>{item.artista}</Text>
      </View>
      <TouchableOpacity 
        onPress={(e) => {
          e.stopPropagation();
          onToggleFavorito(item.id);
        }} 
        style={styles.favoriteButton}
      >
        <Feather name={isFavorito ? "heart" : "heart"} size={24} color={isFavorito ? "#FF0000" : "#FFFFFF"} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

export default function Homepage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [recomendacoes, setRecomendacoes] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingRecomendacoes, setLoadingRecomendacoes] = useState(false);
  
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [novaPlaylistTitulo, setNovaPlaylistTitulo] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('=== DEBUG SESSÃO ===');
      console.log('Tem sessão?', !!session);
      console.log('Usuário:', session?.user);
      console.log('ID do usuário:', session?.user?.id);
      console.log('Email:', session?.user?.email);
      console.log('==============');
    };
    checkAuth();
  }, []);

  const excluirPlaylist = useCallback(async (playlistId: string) => {
    try {
      const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', playlistId);

      if (error) {
        console.error('Erro ao excluir playlist:', error);
        return;
      }

      setPlaylists(prev => prev.filter(playlist => playlist.id !== playlistId));
    } catch (error) {
      console.error('Erro ao excluir playlist:', error);
    }
  }, []);

  const criarPlaylist = useCallback(async () => {
    if (novaPlaylistTitulo.trim() === '') {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        alert('Você precisa estar logado para criar playlists');
        return;
      }

      const { data, error } = await supabase
        .from('playlists')
        .insert({
          user_id: session.user.id,
          titulo: novaPlaylistTitulo,
          capa_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop'
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar playlist:', error);
        alert('Não foi possível criar a playlist');
        return;
      }

      const novaPlaylist: Playlist = {
        id: data.id,
        titulo: data.titulo,
        capaUrl: data.capa_url || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop'
      };

      setPlaylists([...playlists, novaPlaylist]);
      setNovaPlaylistTitulo('');
      setModalVisible(false);
    } catch (error) {
      console.error('Erro ao criar playlist:', error);
      alert('Erro ao criar playlist');
    }
  }, [playlists, novaPlaylistTitulo]);

  const toggleFavorito = useCallback((albumId: string) => {
    setFavoritos(prev => 
      prev.includes(albumId) 
        ? prev.filter(id => id !== albumId)
        : [...prev, albumId]
    );
  }, []);

  const handleAlbumPress = useCallback((album: Album) => {
    router.push({
      pathname: '/album-review',
      params: {
        albumName: encodeURIComponent(album.titulo),
        artist: encodeURIComponent(album.artista),
        coverUrl: encodeURIComponent(album.capaUrl || ''),
        year: new Date().getFullYear().toString(),
        trackCount: '10'
      }
    });
  }, [router]);

  const AddPlaylistCard = () => (
    <TouchableOpacity 
      style={[styles.playlistCard, styles.addCard]} 
      onPress={() => setModalVisible(true)}
    >
      <Feather name="plus" size={30} color="#FFFFFF" />
    </TouchableOpacity>
  );

  useEffect(() => {
  const inicializar = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log('Sessão no inicializar:', session); // Debug
      
      if (session?.user) {
        setUsuario({
          id: session.user.id,
          nome: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuário',
          fotoUrl: session.user.user_metadata?.avatar_url || 'https://via.placeholder.com/150'
        });
        
        setLoadingRecomendacoes(true);
        const recomendacoesResult = await RecomendacaoService.getRecomendacoes(session.user.id);
        setRecomendacoes(recomendacoesResult);
        setLoadingRecomendacoes(false);
        console.log('Recomendações carregadas:', recomendacoesResult.length);
        
      } else {
        setUsuario({
          id: 'guest',
          nome: 'Visitante',
          fotoUrl: 'https://via.placeholder.com/150'
        });
        const recomendacoesResult = await RecomendacaoService.getRecomendacoes(); 
        setRecomendacoes(recomendacoesResult);
      }
    } catch (error) {
      console.error('Erro na inicialização:', error);
      setUsuario({
        id: 'guest',
        nome: 'Visitante',
        fotoUrl: 'https://via.placeholder.com/150'
      });
      const recomendacoesResult = await RecomendacaoService.getRecomendacoes();
      setRecomendacoes(recomendacoesResult);
    } finally {
      setLoading(false);
    }
  };

  inicializar();
}, []);
  useFocusEffect(
    useCallback(() => {
      const carregarPlaylists = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data: playlistsData, error } = await supabase
            .from('playlists')
            .select('id, titulo, capa_url')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false });

          if (!error && playlistsData) {
            const playlistsFormatadas = playlistsData.map(p => ({
              id: p.id,
              titulo: p.titulo,
              capaUrl: p.capa_url || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop'
            }));
            setPlaylists(playlistsFormatadas);
          }
        }
      };

      carregarPlaylists();
    }, [])
  );

  // Função de refresh
const onRefresh = useCallback(async () => {
  setRefreshing(true);
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.user) {
    const [playlistsData, recomendacoesResult] = await Promise.all([
      supabase
        .from('playlists')
        .select('id, titulo, capa_url')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false }),
      RecomendacaoService.getRecomendacoes(session.user.id) // ← PASSA O USER_ID AQUI
    ]);

    if (!playlistsData.error && playlistsData.data) {
      const playlistsFormatadas = playlistsData.data.map(p => ({
        id: p.id,
        titulo: p.titulo,
        capaUrl: p.capa_url || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop'
      }));
      setPlaylists(playlistsFormatadas);
    }

    setRecomendacoes(recomendacoesResult);
  } else {
    // Se não tem sessão, ainda busca recomendações (álbuns populares)
    const recomendacoesResult = await RecomendacaoService.getRecomendacoes(); // ← SEM user_id
    setRecomendacoes(recomendacoesResult);
  }
  
  setRefreshing(false);
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

      <ScrollView 
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#FFFFFF']}
            tintColor="#FFFFFF"
          />
        }
        nestedScrollEnabled={true}
      >
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
            initialNumToRender={5}
            maxToRenderPerBatch={3}
            windowSize={3}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {usuario?.id === 'guest' ? 'Álbuns Populares' : 'Recomendados para Você'}
          </Text>
          {loadingRecomendacoes ? (
            <ActivityIndicator size="small" color="#FFFFFF" style={{ marginVertical: 20 }} />
          ) : recomendacoes.length > 0 ? (
            <FlatList
              data={recomendacoes}
              renderItem={({ item }) => (
                <AlbumListItem 
                  item={item} 
                  isFavorito={favoritos.includes(item.id)}
                  onToggleFavorito={toggleFavorito}
                  onPress={handleAlbumPress}
                />
              )}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              initialNumToRender={10}
              maxToRenderPerBatch={5}
              windowSize={5}
              removeClippedSubviews={true}
              getItemLayout={(data, index) => ({
                length: 80,
                offset: 80 * index,
                index,
              })}
            />
          ) : (
            <View style={styles.loginSection}>
              <Text style={styles.emptyText}>
                {usuario?.id === 'guest' 
                  ? 'Faça login para ver recomendações personalizadas' 
                  : 'Avalie alguns álbuns para receber recomendações personalizadas'}
              </Text>
              {usuario?.id === 'guest' && (
                <TouchableOpacity 
                  style={styles.loginButton}
                  onPress={() => router.push('/login')}
                >
                  <Text style={styles.loginButtonText}>Fazer Login</Text>
                </TouchableOpacity>
              )}
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
  emptyText: {
    color: '#ccc',
    textAlign: 'center',
    fontSize: 16,
    marginVertical: 20,
    fontStyle: 'italic',
  },
  loginSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loginButton: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
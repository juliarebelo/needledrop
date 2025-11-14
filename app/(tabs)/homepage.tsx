import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
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
import { supabase } from '../../services/supabase';
import CustomBottomNav from '../components/CustomBottomNav';

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

const Header = React.memo(({ usuario }: { usuario: Usuario | null }) => {
  const router = useRouter(); 

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => alert('Abrir menu lateral!')}>
        <Feather name="menu" size={32} color="#FFFFFF" />
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
});

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

const AlbumListItem = React.memo(({ item, isFavorito, onToggleFavorito }: { item: Album; isFavorito: boolean; onToggleFavorito: (id: string) => void }) => (
  <TouchableOpacity style={styles.albumItem}>
    <Image 
      source={{ uri: item.capaUrl || 'https://via.placeholder.com/150' }} 
      style={styles.albumImage}
      resizeMode="cover"
      defaultSource={require('../../assets/images/icon.png')}
    />
    <View style={styles.albumTextContainer}>
      <Text style={styles.albumTitle} numberOfLines={1}>{item.titulo}</Text>
      <Text style={styles.albumArtist} numberOfLines={1}>{item.artista}</Text>
    </View>
    <TouchableOpacity onPress={() => onToggleFavorito(item.id)} style={styles.favoriteButton}>
      <Feather name={isFavorito ? "heart" : "heart"} size={24} color={isFavorito ? "#FF0000" : "#FFFFFF"} />
    </TouchableOpacity>
  </TouchableOpacity>
));

export default function Homepage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [albuns, setAlbuns] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [novaPlaylistTitulo, setNovaPlaylistTitulo] = useState('');

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

  const buscarAlbunsUnicos = async (): Promise<Album[]> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    try {
      const { data: musicasData, error } = await supabase
        .from('musicas')
        .select('id, artist, album, url_capa')
        .not('album', 'is', null)
        .not('artist', 'is', null)
        .not('url_capa', 'is', null)
        .limit(50)
        .abortSignal(controller.signal);

      clearTimeout(timeout);

      if (error || !musicasData) {
        console.warn('[Albuns] Erro ao buscar:', error?.message);
        return [];
      }

      const albunsUnicos: Album[] = [];
      const vistos = new Set<string>();

      for (const musica of musicasData) {
        if (!musica.artist || !musica.album || !musica.url_capa) continue;
        const chave = `${musica.artist.toLowerCase()}-${musica.album.toLowerCase()}`;
        if (vistos.has(chave)) continue;
        vistos.add(chave);
        albunsUnicos.push({
          id: musica.id,
          titulo: musica.album,
          artista: musica.artist,
          capaUrl: musica.url_capa
        });
        if (albunsUnicos.length >= 5) break;
      }
      return albunsUnicos;
    } catch (error: any) {
      clearTimeout(timeout);
      if (error?.name === 'AbortError') {
        console.warn('[Albuns] Timeout na busca');
      } else {
        console.warn('[Albuns] Erro inesperado', error);
      }
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
    const inicializar = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUsuario({
          id: session.user.id,
          nome: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Amigo',
          fotoUrl: session.user.user_metadata?.avatar_url || 'https://via.placeholder.com/150'
        });
      } else {
        setUsuario({
          id: 'guest',
          nome: 'Amigo',
          fotoUrl: 'https://via.placeholder.com/150'
        });
      }
    };

    inicializar();

    let ativo = true;
    const carregar = async () => {
      setLoading(true);
      const result = await buscarAlbunsUnicos();
      if (ativo) setAlbuns(result);
      setLoading(false);
    };
    carregar();
    return () => { ativo = false; };
  }, []);

  // Recarregar playlists quando voltar para a tela
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
          <Text style={styles.sectionTitle}>Álbuns em Destaque</Text>
          <FlatList
            data={albuns}
            renderItem={({ item }) => (
              <AlbumListItem 
                item={item} 
                isFavorito={favoritos.includes(item.id)}
                onToggleFavorito={toggleFavorito}
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
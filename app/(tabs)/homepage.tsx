import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, FlatList, Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View
} from 'react-native';

const API_BASE_URL = 'http://192.168.0.5:3000';

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


const Header = ({ usuario }: { usuario: Usuario | null }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={() => alert('Abrir menu lateral!')}>
      <Feather name="menu" size={32} color="#FFFFFF" />
    </TouchableOpacity>
    <Text style={styles.greeting}>Olá, {usuario?.nome || 'Usuário'}!</Text>
    <Image
      source={{ uri: usuario?.fotoUrl || 'https://via.placeholder.com/150' }}
      style={styles.avatar}
    />
  </View>
);

const PlaylistCard = ({ item }: { item: Playlist }) => (
  <TouchableOpacity style={styles.playlistCard}>
    <Image source={{ uri: item.capaUrl || 'https://via.placeholder.com/150' }} style={styles.playlistImage} />
    <Text style={styles.playlistTitle}>{item.titulo}</Text>
  </TouchableOpacity>
);

const AddPlaylistCard = () => (
    <TouchableOpacity style={[styles.playlistCard, styles.addCard]}>
      <Feather name="plus" size={30} color="#FFFFFF" />
    </TouchableOpacity>
);

const AlbumListItem = ({ item }: { item: Album }) => (
  <TouchableOpacity style={styles.albumItem}>
    <Image source={{ uri: item.capaUrl || 'https://via.placeholder.com/150' }} style={styles.albumImage} />
    <View style={styles.albumTextContainer}>
      <Text style={styles.albumTitle}>{item.titulo}</Text>
      <Text style={styles.albumArtist}>{item.artista}</Text>
    </View>
  </TouchableOpacity>
);

const CustomBottomNav = () => (
  <View style={styles.navContainer}>
    <TouchableOpacity><Image source={require('../../assets/images/home.png')} style={styles.navIcon} /></TouchableOpacity>
    <TouchableOpacity><Image source={require('../../assets/images/search.png')} style={styles.navIcon} /></TouchableOpacity>
    <TouchableOpacity><Image source={require('../../assets/images/user.png')} style={styles.navIcon} /></TouchableOpacity>
  </View>
);

export default function Homepage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [recomendados, setRecomendados] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usuarioRes, playlistsRes, recomendadosRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/usuarios/me`),
          fetch(`${API_BASE_URL}/api/me/playlists`),
          fetch(`${API_BASE_URL}/api/recomendacoes`),
        ]);

        if (!usuarioRes.ok || !playlistsRes.ok || !recomendadosRes.ok) {
          throw new Error('Falha ao buscar dados do servidor');
        }

        const usuarioData: Usuario = await usuarioRes.json();
        const playlistsData: Playlist[] = await playlistsRes.json();
        const recomendadosData: Album[] = await recomendadosRes.json();

        setUsuario(usuarioData);
        setPlaylists(playlistsData);
        setRecomendados(recomendadosData);
      } catch (err) {
        console.error(err);
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
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <Header usuario={usuario} />
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Minhas Playlists</Text>
          <FlatList
            data={playlists}
            renderItem={({ item }) => <PlaylistCard item={item} />}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            ListFooterComponent={<AddPlaylistCard />}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Álbuns recomendados</Text>
          {recomendados.map(item => <AlbumListItem key={item.id} item={item} />)}
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
  playlistCard: {
    width: 140,
    marginRight: 15,
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
});
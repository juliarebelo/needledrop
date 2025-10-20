import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const API_BASE_URL = 'http://192.168.0.5:3000';

interface Usuario {
  id: string;
  nome: string;
  fotoUrl: string;
  headerUrl: string;
}
interface Album {
  id: string;
  titulo: string;
  capaUrl: string;
}
interface Avaliacao {
  id: string;
  titulo: string;
  nota: number;
  capaUrl: string;
}

const ProfileHeader = ({ usuario }: { usuario: Usuario | null }) => {
  const handleEdit = () => {
    alert('Função para editar foto/header!');
  };

  return (
    <View style={styles.headerContainer}>
      <Image 
        source={{ uri: usuario?.headerUrl || 'https://via.placeholder.com/400x200' }} 
        style={styles.headerImage} 
      />
      <View style={styles.avatarContainer}>
        <Image 
          source={{ uri: usuario?.fotoUrl || 'https://via.placeholder.com/150' }} 
          style={styles.avatar} 
        />
        <TouchableOpacity style={styles.editIcon} onPress={handleEdit}>
            <Feather name="edit-2" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
      <Text style={styles.userName}>{usuario?.nome}</Text>
    </View>
  );
};

const FavoriteAlbums = ({ favoritos }: { favoritos: Album[] }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Álbuns favoritos</Text>
    <FlatList
      data={favoritos}
      renderItem={({ item }) => (
        <TouchableOpacity>
          <Image source={{ uri: item.capaUrl }} style={styles.albumCover} />
        </TouchableOpacity>
      )}
      keyExtractor={item => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
    />
  </View>
);

const RecentReviews = ({ recentes }: { recentes: Avaliacao[] }) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>Avaliações recentes</Text>
        <View style={styles.reviewsContainer}>
            {recentes.map(item => (
                <TouchableOpacity key={item.id} style={styles.reviewCard}>
                    <Image source={{ uri: item.capaUrl }} style={styles.reviewImage} />
                </TouchableOpacity>
            ))}
        </View>
        <TouchableOpacity>
            <Text style={styles.seeAllText}>Ver todas</Text>
        </TouchableOpacity>
    </View>
);

const CustomBottomNav = () => (
    <View style={styles.navContainer}>
      <TouchableOpacity><Image source={require('../../assets/images/home.png')} style={styles.navIcon} /></TouchableOpacity>
      <TouchableOpacity><Image source={require('../../assets/images/search.png')} style={styles.navIcon} /></TouchableOpacity>
      <TouchableOpacity><Image source={require('../../assets/images/user.png')} style={styles.navIcon} /></TouchableOpacity>
    </View>
);

export default function ProfileScreen() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [favoritos, setFavoritos] = useState<Album[]>([]);
  const [recentes, setRecentes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, favRes, recentRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/usuarios/me`),
          fetch(`${API_BASE_URL}/api/me/favoritos`),
          fetch(`${API_BASE_URL}/api/me/avaliacoes/recentes`),
        ]);

        const userData = await userRes.json();
        const favData = await favRes.json();
        const recentData = await recentRes.json();

        setUsuario(userData);
        setFavoritos(favData);
        setRecentes(recentData);

      } catch (error) {
        console.error("Erro ao buscar dados do perfil:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#fff" /></View>;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView>
        <ProfileHeader usuario={usuario} />
        <FavoriteAlbums favoritos={favoritos} />
        <RecentReviews recentes={recentes} />
      </ScrollView>
      <CustomBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#300505' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#300505' },
    headerContainer: { alignItems: 'center', marginBottom: 20 },
    headerImage: { width: '100%', height: 200 },
    avatarContainer: { marginTop: -60 },
    avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: '#300505' },
    editIcon: { 
        position: 'absolute', 
        bottom: 5, 
        right: 5, 
        backgroundColor: '#c0392b', 
        padding: 8, 
        borderRadius: 15,
        zIndex: 1,
    },
    userName: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginTop: 10 },
    section: { marginBottom: 20, paddingLeft: 15 },
    sectionTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
    albumCover: { width: 110, height: 110, borderRadius: 8, marginRight: 15 },
    reviewsContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 15, marginBottom: 10 },
    reviewCard: { alignItems: 'center' },
    reviewImage: { width: 100, height: 100, borderRadius: 8 },
    seeAllText: { color: '#aaa', textAlign: 'right', marginRight: 15, marginTop: 10 },
    navContainer: {
        position: 'absolute', bottom: 20, left: 20, right: 20,
        backgroundColor: 'rgba(42, 12, 12, 0.9)', borderRadius: 30,
        height: 60, flexDirection: 'row', justifyContent: 'space-around',
        alignItems: 'center', borderWidth: 1, borderColor: '#555'
    },
    navIcon: { width: 28, height: 28, resizeMode: 'contain' }
});

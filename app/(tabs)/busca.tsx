import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../../services/supabase';

interface Musica {
  id: string;
  title: string | null;
  artist: string;
  album: string | null;
  url_capa: string | null;
  url_spotify: string | null;
  year?: number;
}

interface Suggestion {
  id: string;
  texto: string;
}

type SearchResult = (Musica & { type: 'album' }) | (Suggestion & { type: 'suggestion' });

// Sugestões fixas (podem vir do Supabase depois)
const mockSuggestions: Suggestion[] = [
  { id: "s1", texto: "Rock" },
  { id: "s2", texto: "Pop" },
  { id: "s3", texto: "MPB" },
  { id: "s4", texto: "Sertanejo" },
  { id: "s5", texto: "Funk" },
];

const SuggestionItem = ({ item }: { item: Suggestion }) => (
  <TouchableOpacity style={styles.suggestionItem}>
    <Feather name="search" size={20} color="#aaa" />
    <Text style={styles.suggestionText}>{item.texto}</Text>
  </TouchableOpacity>
);

const AlbumResultItem = ({ item, onPress }: { item: Musica; onPress: (album: Musica) => void }) => (
  <TouchableOpacity 
    style={styles.albumItem} 
    onPress={() => onPress(item)}
  >
    <Image 
      source={{ uri: item.url_capa || 'https://via.placeholder.com/150' }} 
      style={styles.albumImage} 
    />
    <View style={styles.albumInfo}>
      <Text style={styles.albumTitle}>{item.album || item.title || 'Sem título'}</Text>
      <Text style={styles.albumArtist}>{item.artist}</Text>
    </View>
  </TouchableOpacity>
);

const CustomBottomNav = () => {
  const router = useRouter(); 
  return (
    <View style={navStyles.navContainer}>
      <TouchableOpacity onPress={() => router.push('/(tabs)/homepage')}>
        <Feather name="home" size={24} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/(tabs)/busca')}>
        <Feather name="search" size={24} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/(tabs)/perfil')}>
        <Feather name="user" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAlbumPress = (album: Musica) => {
  // Navega para a tela de resenha passando os dados do álbum como parâmetros
  router.push({
    pathname: '/album-review',
    params: {
      albumName: encodeURIComponent(album.album || album.title || 'Álbum Desconhecido'),
      artist: encodeURIComponent(album.artist),
      year: album.year?.toString() || '2020',
      trackCount: '12',
      coverUrl: encodeURIComponent(album.url_capa || '')
    }
  });
};

  useEffect(() => {
    const searchInSupabase = async () => {
      if (query.length > 0) {
        setLoading(true);

        try {
          // Busca no Supabase
          const { data: musicasData, error } = await supabase
            .from('musicas')
            .select('id, title, artist, album, url_capa, url_spotify')
            .or(`title.ilike.%${query}%,artist.ilike.%${query}%,album.ilike.%${query}%`)
            .limit(20);

          if (error) {
            console.error('Erro na busca:', error);
            setResults([]);
          } else {
            const filteredAlbuns: SearchResult[] = (musicasData || []).map((a: Musica) => ({ 
              ...a, 
              type: 'album' 
            }));

            // Filtra sugestões que começam com a query
            const filteredSuggestions: SearchResult[] = mockSuggestions
              .filter((s: Suggestion) => s.texto.toLowerCase().startsWith(query.toLowerCase()))
              .map((s: Suggestion) => ({ ...s, type: 'suggestion' }));

            setResults([...filteredSuggestions, ...filteredAlbuns]);
          }
        } catch (error) {
          console.error('Erro na busca:', error);
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    };

    searchInSupabase();
  }, [query]);

  return (
    <View style={styles.container}>
      {/* Conteúdo principal */}
      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder="O que você quer ouvir?"
            placeholderTextColor="#aaa"
            value={query}
            onChangeText={setQuery}
            autoFocus={true}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Feather name="x" size={20} color="#aaa" />
            </TouchableOpacity>
          )}
        </View>

        {loading && <ActivityIndicator color="#fff" style={{ marginTop: 20 }}/>}

        <FlatList
          data={results}
          keyExtractor={(item) => item.type + item.id}
          renderItem={({ item }) => {
            if (item.type === 'suggestion') {
              return <SuggestionItem item={item} />;
            }
            if (item.type === 'album') {
              return <AlbumResultItem item={item} onPress={handleAlbumPress} />;
            }
            return null;
          }}
          showsVerticalScrollIndicator={false}
          style={styles.list}
        />
      </View>

      {/* Navbar fixo na parte inferior */}
      <CustomBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#300505',
  },
  content: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#4a1e1e', 
    borderRadius: 8, 
    paddingHorizontal: 15, 
    marginBottom: 20 
  },
  input: { 
    flex: 1, 
    height: 50, 
    color: '#fff', 
    fontSize: 16 
  },
  list: {
    flex: 1,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  suggestionText: {
    color: '#ddd',
    fontSize: 16,
    marginLeft: 15,
  },
  albumItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginVertical: 10 
  },
  albumImage: { 
    width: 60, 
    height: 60, 
    borderRadius: 5, 
    marginRight: 15 
  },
  albumInfo: { 
    flex: 1 
  },
  albumTitle: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  albumArtist: { 
    color: '#ccc',
    fontSize: 14,
  },
});

const navStyles = StyleSheet.create({
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#2a0c0c',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
});
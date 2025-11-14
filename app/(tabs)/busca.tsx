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
import CustomBottomNav from '../components/CustomBottomNav';

interface Musica {
  id: string;
  title: string | null;
  artist: string;
  album: string | null;
  url_capa: string | null;
  url_spotify: string | null;
  year?: number;
}

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

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Musica[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAlbumPress = (album: Musica) => {
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
          const { data: musicasData, error } = await supabase
            .from('musicas')
            .select('id, title, artist, album, url_capa, url_spotify')
            .or(`title.ilike.%${query}%,artist.ilike.%${query}%,album.ilike.%${query}%`)
            .limit(20);

          if (error) {
            console.error('Erro na busca:', error);
            setResults([]);
          } else {
            setResults(musicasData || []);
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
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AlbumResultItem item={item} onPress={handleAlbumPress} />
          )}
          showsVerticalScrollIndicator={false}
          style={styles.list}
        />
      </View>

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
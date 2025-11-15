import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
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
import CustomBottomNav from '../_components/CustomBottomNav';

interface Musica {
  id: string;
  title: string | null;
  artist: string;
  album: string | null;
  url_capa: string | null;
  year?: number;
}

const AlbumResultItem = React.memo(({ item, onPress }: { item: Musica; onPress: (album: Musica) => void }) => (
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
));

export default function BuscaScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Musica[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef<number | undefined>(undefined);

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
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (query.length === 0) {
      setResults([]);
      return;
    }

    if (query.length < 2) {
      return;
    }

    debounceTimer.current = setTimeout(() => {
      searchInSupabase();
    }, 400) as unknown as number;

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  const searchInSupabase = async () => {
    setLoading(true);

    try {
      const searchTerm = query.toLowerCase().trim();
      const { data: musicasData, error } = await supabase
        .from('musicas')
        .select('id, title, artist, album, url_capa')
        .or(`title.ilike.%${searchTerm}%,artist.ilike.%${searchTerm}%,album.ilike.%${searchTerm}%`)
        .not('url_capa', 'is', null)
        .limit(50);

      if (error) {
        console.error('Erro na busca:', error);
        setResults([]);
      } else {
        const filtered = (musicasData || [])
          .map(item => {
            let score = 0;
            const title = (item.title || '').toLowerCase();
            const artist = (item.artist || '').toLowerCase();
            const album = (item.album || '').toLowerCase();
            
            if (artist === searchTerm) score += 100;
            if (album === searchTerm) score += 100;
            if (title === searchTerm) score += 50;
            
            if (artist.startsWith(searchTerm)) score += 50;
            if (album.startsWith(searchTerm)) score += 50;
            if (title.startsWith(searchTerm)) score += 25;
            
            if (artist.includes(searchTerm)) score += 10;
            if (album.includes(searchTerm)) score += 10;
            if (title.includes(searchTerm)) score += 5;
            
            return { ...item, score };
          })
          .filter(item => item.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);
          
        setResults(filtered);
      }
    } catch (error) {
      console.error('Erro na busca:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

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
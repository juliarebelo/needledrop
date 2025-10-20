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
import { Album, mockAlbuns, mockSuggestions, Suggestion } from '../../data/mockData';

type SearchResult = (Album & { type: 'album' }) | (Suggestion & { type: 'suggestion' });

const SuggestionItem = ({ item }: { item: Suggestion }) => (
  <TouchableOpacity style={styles.suggestionItem}>
    <Feather name="search" size={20} color="#aaa" />
    <Text style={styles.suggestionText}>{item.texto}</Text>
  </TouchableOpacity>
);

const AlbumResultItem = ({ item }: { item: Album }) => (
  <TouchableOpacity style={styles.albumItem}>
    <Image source={{ uri: item.capaUrl }} style={styles.albumImage} />
    <View style={styles.albumInfo}>
      <Text style={styles.albumTitle}>{item.titulo}</Text>
      <Text style={styles.albumArtist}>{item.artista} - {item.ano}</Text>
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
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length > 0) {
      setLoading(true);

      const lowerCaseQuery = query.toLowerCase();

      const filteredSuggestions: SearchResult[] = mockSuggestions
        .filter((s: Suggestion) => s.texto.toLowerCase().startsWith(lowerCaseQuery))
        .map((s: Suggestion) => ({ ...s, type: 'suggestion' }));

      const filteredAlbuns: SearchResult[] = mockAlbuns
        .filter((album: Album) => 
          album.titulo.toLowerCase().includes(lowerCaseQuery) ||
          album.artista.toLowerCase().includes(lowerCaseQuery)
        )
        .map((a: Album) => ({ ...a, type: 'album' }));

      setResults([...filteredSuggestions, ...filteredAlbuns]);
      setLoading(false);
    } else {
      setResults([]);
    }
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
              return <AlbumResultItem item={item} />;
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
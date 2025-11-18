import { Feather, FontAwesome } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../services/supabase';

export default function AlbumReview() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [existingReview, setExistingReview] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [spotifyUrl, setSpotifyUrl] = useState<string | null>(null);

  const albumName = params.albumName ? decodeURIComponent(params.albumName as string) : 'Álbum Desconhecido';
  const artist = params.artist ? decodeURIComponent(params.artist as string) : 'Artista Desconhecido';
  const year = parseInt(params.year as string) || 2020;
  const trackCount = parseInt(params.trackCount as string) || 12;
  const coverUrl = params.coverUrl ? decodeURIComponent(params.coverUrl as string) : '';
  const returnTo = (params.returnTo as string) || '/(tabs)/homepage';

  useEffect(() => {
    setRating(0);
    setReview('');
    setExistingReview(null);
    setIsEditing(false);
    setIsLoading(true);
    setSpotifyUrl(null);
    
    checkUserAndReview();
    fetchStreamingUrls();
  }, [albumName, artist]);

  const checkUserAndReview = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      if (session?.user) {
        const { data, error } = await supabase
          .from('resenhas')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('album_name', albumName)
          .eq('artist', artist)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Erro ao buscar resenha:', error);
        }

        if (data) {
          setExistingReview(data);
          setRating(data.rating);
          setReview(data.review_text);
          setIsEditing(true);
        } else {
          setRating(0);
          setReview('');
          setIsEditing(false);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar usuário e resenha:', error);
      setRating(0);
      setReview('');
      setIsEditing(false);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStreamingUrls = async () => {
    try {
      const { data, error } = await supabase
        .from('musicas')
        .select('url_spotify')
        .eq('artist', artist)
        .eq('album', albumName)
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar URLs:', error);
      }

      if (data) {
        setSpotifyUrl(data.url_spotify);
      }
    } catch (error) {
      console.error('Erro ao buscar URLs de streaming:', error);
    }
  };

  const handleOpenUrl = async (url: string | null, platform: string) => {
    if (!url) {
      Alert.alert('Indisponível', `Link do ${platform} não disponível para este álbum.`);
      return;
    }

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Erro', `Não foi possível abrir o link do ${platform}.`);
      }
    } catch (error) {
      console.error(`Erro ao abrir ${platform}:`, error);
      Alert.alert('Erro', `Falha ao abrir o ${platform}.`);
    }
  };

  const handleRatingPress = (selectedRating: number) => {
    if (Math.floor(rating) === selectedRating && rating === selectedRating) {
      setRating(selectedRating - 0.5);
    } else {
      setRating(selectedRating);
    }
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => {
      const isFilled = star <= rating;
      const isHalf = star - 0.5 === rating;
      
      return (
        <TouchableOpacity
          key={star}
          onPress={() => handleRatingPress(star)}
          style={styles.starButton}
        >
          {isHalf ? (
            <View style={styles.starContainer}>
              <FontAwesome
                name="star"
                size={32}
                color="#666"
                style={styles.starBackground}
              />
              <View style={styles.halfStarContainer}>
                <FontAwesome
                  name="star"
                  size={32}
                  color="#FFD700"
                />
              </View>
            </View>
          ) : (
            <FontAwesome
              name="star"
              size={32}
              color={isFilled ? '#FFD700' : '#666'}
            />
          )}
        </TouchableOpacity>
      );
    });
  };

  const handleSubmitReview = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!rating || !review.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (isEditing && existingReview?.id) {
        const { error } = await supabase
          .from('resenhas')
          .update({
            rating: rating,
            review_text: review,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingReview.id);

        if (error) throw error;
        
        router.replace(returnTo as any);
      } else {
        const { error } = await supabase
          .from('resenhas')
          .insert({
            user_id: user.id,
            album_name: albumName,
            artist: artist,
            year: year,
            track_count: trackCount,
            album_cover: coverUrl,
            rating: rating,
            review_text: review
          });

        if (error) throw error;
        
        router.replace(returnTo as any);
      }
    } catch (error: any) {
      console.error('Erro ao salvar resenha:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!existingReview?.id || !user) {
      console.log('Delete review - Missing data:', { existingReview: existingReview?.id, user: user?.id });
      return;
    }

    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir esta resenha?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Deleting review with id:', existingReview.id);
              const { data, error } = await supabase
                .from('resenhas')
                .delete()
                .eq('id', existingReview.id)
                .select();

              if (error) {
                console.error('Supabase delete error:', error);
                throw error;
              }

              console.log('Delete successful:', data);
              router.replace(returnTo as any);
            } catch (error) {
              console.error('Erro ao excluir resenha:', error);
              Alert.alert('Erro', 'Não foi possível excluir a resenha');
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace(returnTo as any)} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Editar Resenha' : 'Escreva uma Resenha'}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.albumInfo}>
          <Image
            source={{ uri: coverUrl || 'https://via.placeholder.com/150' }}
            style={styles.albumCover}
          />
          <View style={styles.albumDetails}>
            <Text style={styles.albumName}>{albumName}</Text>
            <Text style={styles.artistName}>{artist}</Text>
          </View>
        </View>

        <View style={styles.streamingSection}>
          <TouchableOpacity 
            style={[styles.streamingButton, styles.spotifyButton]}
            onPress={() => handleOpenUrl(spotifyUrl, 'Spotify')}
          >
            <Image 
              source={{ uri: 'https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_White.png' }} 
              style={styles.streamingIcon}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dê a sua nota</Text>
          <View style={styles.starsContainer}>
            {renderStars()}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Escreva aqui o que achou desse álbum...</Text>
          <TextInput
            style={styles.reviewInput}
            placeholder="Compartilhe sua opinião sobre o álbum, suas músicas favoritas, o que mais gostou..."
            placeholderTextColor="#888"
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            value={review}
            onChangeText={setReview}
          />
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!rating || !review.trim() || isSubmitting) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmitReview}
            disabled={!rating || !review.trim() || isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting 
                ? 'Salvando...' 
                : isEditing 
                  ? 'Atualizar Resenha' 
                  : 'Publicar Resenha'
              }
            </Text>
          </TouchableOpacity>

          {isEditing && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteReview}
            >
              <Text style={styles.deleteButtonText}>Excluir Resenha</Text>
            </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#300505',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    marginTop: 30,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 24,
  },
  albumInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  albumCover: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 15,
  },
  albumDetails: {
    flex: 1,
  },
  albumName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  artistName: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 5,
  },
  streamingSection: {
    marginBottom: 30,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  streamingButton: {
    backgroundColor: '#4a1e1e',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 60,
  },
  spotifyButton: {
    backgroundColor: '#1a1a1a',
  },
  streamingIcon: {
    width: 90,
    height: 30,
    resizeMode: 'contain',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  starButton: {
    padding: 5,
  },
  starContainer: {
    position: 'relative',
    width: 32,
    height: 32,
  },
  starBackground: {
    position: 'absolute',
  },
  halfStarContainer: {
    position: 'absolute',
    width: 16,
    height: 32,
    overflow: 'hidden',
  },
  reviewInput: {
    backgroundColor: '#4a1e1e',
    borderRadius: 8,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    minHeight: 150,
    textAlignVertical: 'top',
  },
  actionsContainer: {
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#666',
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e74c3c',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#e74c3c',
    fontSize: 16,
  },
});
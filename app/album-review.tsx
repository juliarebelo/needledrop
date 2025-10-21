import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../services/supabase';

// Componente de navegação inferior
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

  // Decodifica os parâmetros
  const albumName = params.albumName ? decodeURIComponent(params.albumName as string) : 'Álbum Desconhecido';
  const artist = params.artist ? decodeURIComponent(params.artist as string) : 'Artista Desconhecido';
  const year = parseInt(params.year as string) || 2020;
  const trackCount = parseInt(params.trackCount as string) || 12;
  const coverUrl = params.coverUrl ? decodeURIComponent(params.coverUrl as string) : '';

  // Verifica o usuário logado e resenhas existentes
  useEffect(() => {
    checkUserAndReview();
  }, [albumName, artist]);

  const checkUserAndReview = async () => {
    try {
      // Pega a sessão atual
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      if (session?.user) {
        // Busca resenha existente
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
          setIsEditing(false);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar usuário e resenha:', error);
      setIsEditing(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRatingPress = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleSubmitReview = async () => {
    if (!user) {
      // Redireciona direto para login sem pop-up
      router.push('/login');
      return;
    }

    if (!rating || !review.trim()) {
      // Apenas não faz nada se não tiver nota ou review
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (isEditing && existingReview?.id) {
        // Atualizar resenha existente
        const { error } = await supabase
          .from('resenhas')
          .update({
            rating,
            review_text: review,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingReview.id);

        if (error) throw error;
        
        // Volta para tela anterior sem pop-up de sucesso
        router.back();
      } else {
        // Criar nova resenha
        const { error } = await supabase
          .from('resenhas')
          .insert({
            user_id: user.id,
            album_name: albumName,
            artist: artist,
            year: year,
            track_count: trackCount,
            cover_url: coverUrl,
            rating: rating,
            review_text: review
          });

        if (error) throw error;
        
        // Volta para tela anterior sem pop-up de sucesso
        router.back();
      }
    } catch (error: any) {
      console.error('Erro ao salvar resenha:', error);
      // Não mostra pop-up de erro
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!existingReview?.id || !user) return;

    // MANTÉM APENAS ESTE POP-UP (confirmação de exclusão)
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
              const { error } = await supabase
                .from('resenhas')
                .delete()
                .eq('id', existingReview.id);

              if (error) throw error;

              // Volta para tela anterior sem pop-up de sucesso
              router.back();
            } catch (error) {
              console.error('Erro ao excluir resenha:', error);
              // Não mostra pop-up de erro
            }
          }
        }
      ]
    );
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <TouchableOpacity
        key={star}
        onPress={() => handleRatingPress(star)}
        style={styles.starButton}
      >
        <Feather
          name="star"
          size={32}
          color={star <= rating ? '#FFD700' : '#666'}
        />
      </TouchableOpacity>
    ));
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Editar Resenha' : 'Escreva uma Resenha'}
          </Text>
          <View style={styles.placeholder} />
        </View>

        {/* Album Info */}
        <View style={styles.albumInfo}>
          <Image
            source={{ uri: coverUrl || 'https://via.placeholder.com/150' }}
            style={styles.albumCover}
          />
          <View style={styles.albumDetails}>
            <Text style={styles.albumName}>{albumName}</Text>
            <Text style={styles.artistName}>{artist}</Text>
            <Text style={styles.albumMeta}>{year} • {trackCount} músicas</Text>
          </View>
        </View>

        {/* Rating Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dê a sua nota</Text>
          <View style={styles.starsContainer}>
            {renderStars()}
          </View>
        </View>

        {/* Review Section */}
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

        {/* Botões de Ação */}
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

      {/* Bottom Navigation */}
      <CustomBottomNav />
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
  albumMeta: {
    color: '#888',
    fontSize: 14,
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
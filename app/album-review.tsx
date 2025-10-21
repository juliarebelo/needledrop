import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
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

// Componente de navegação inferior (ajuste conforme seu projeto)
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

  // Decodifica os parâmetros com valores padrão
  const albumName = params.albumName ? decodeURIComponent(params.albumName as string) : 'Álbum Desconhecido';
  const artist = params.artist ? decodeURIComponent(params.artist as string) : 'Artista Desconhecido';
  const year = params.year as string || '2020';
  const trackCount = params.trackCount as string || '12';
  const coverUrl = params.coverUrl ? decodeURIComponent(params.coverUrl as string) : '';

  const handleRatingPress = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleSubmitReview = async () => {
    if (!rating || !review.trim()) {
      Alert.alert('Atenção', 'Por favor, dê uma nota e escreva uma resenha antes de publicar.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Aqui você pode adicionar a lógica para salvar no Supabase
      console.log('Resenha submetida:', {
        album: albumName,
        artist,
        rating,
        review,
        coverUrl
      });

      // Simulando uma requisição
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Sucesso!',
        'Sua resenha foi publicada com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao publicar resenha:', error);
      Alert.alert('Erro', 'Não foi possível publicar sua resenha. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Escreva uma resenha</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Album Info */}
        <View style={styles.albumInfo}>
          <Image
            source={{ uri: coverUrl || 'https://via.placeholder.com/150' }}
            style={styles.albumCover}
            defaultSource={{ uri: 'https://via.placeholder.com/150' }}
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

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!rating || !review.trim() || isSubmitting) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmitReview}
          disabled={!rating || !review.trim() || isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Publicando...' : 'Publicar'}
          </Text>
        </TouchableOpacity>
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
  submitButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { AvaliacaoService } from '../../services/avaliacaoServices';

// Mock - substitua pela autenticação real
const USUARIO_ATUAL = {
  id: 'user-123',
  nome: 'João Silva'
};

export default function ResenhaScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Dados do álbum
  const album = {
    id: Array.isArray(params.albumId) ? params.albumId[0] : params.albumId || '1',
    titulo: Array.isArray(params.titulo) ? params.titulo[0] : params.titulo || 'Álbum',
    artista: Array.isArray(params.artista) ? params.artista[0] : params.artista || 'Artista',
    ano: Array.isArray(params.ano) ? params.ano[0] : params.ano || '2020'
  };

  const handlePublicar = async () => {
    if (nota === 0) {
      Alert.alert('Atenção', 'Por favor, selecione uma nota!');
      return;
    }

    setEnviando(true);

    try {
      await AvaliacaoService.salvarAvaliacao({
        usuario_id: USUARIO_ATUAL.id,
        album_id: album.id,
        nota: nota,
        comentario: comentario
      });

      Alert.alert('Sucesso', 'Resenha publicada com sucesso!');
      router.back();
    } catch (error) {
      console.error('Erro:', error);
      Alert.alert('Erro', 'Não foi possível publicar a resenha');
    } finally {
      setEnviando(false);
    }
  };

  // Renderizar 5 estrelas com opções de 0.5 em 0.5
  const renderEstrelas = () => {
    const estrelas = [];
    
    for (let i = 1; i <= 5; i++) {
      // Verificar se esta estrela deve estar preenchida
      const estrelaCheia = nota >= i;
      const meiaEstrela = nota >= i - 0.5 && nota < i;
      
      estrelas.push(
        <TouchableOpacity
          key={i}
          style={styles.estrelaContainer}
          onPress={() => {
            // Toque na estrela inteira = nota inteira
            setNota(i);
          }}
          onLongPress={() => {
            // Press longa = meia estrela
            setNota(i - 0.5);
          }}
          delayLongPress={200}
        >
          {/* Estrela de fundo (sempre vazia) */}
          <Text style={styles.estrelaFundo}>⭐</Text>
          
          {/* Overlay para estrela cheia ou meia estrela */}
          {estrelaCheia && (
            <Text style={styles.estrelaPreenchida}>⭐</Text>
          )}
          
          {meiaEstrela && (
            <View style={styles.meiaEstrelaOverlay}>
              <Text style={styles.estrelaPreenchida}>⭐</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    }
    
    return estrelas;
  };

  // Versão alternativa mais simples - apenas toques nas estrelas
  const renderEstrelasSimples = () => {
    const estrelas = [];
    
    for (let i = 1; i <= 5; i++) {
      estrelas.push(
        <TouchableOpacity
          key={i}
          onPress={() => {
            // Toque simples: estrela cheia
            setNota(i);
          }}
        >
          <Text style={
            nota >= i ? styles.estrelaCheia : styles.estrelaVazia
          }>
            ⭐
          </Text>
        </TouchableOpacity>
      );
      
      // Adicionar botão para meia estrela entre as estrelas
      if (i < 5) {
        estrelas.push(
          <TouchableOpacity
            key={`meia-${i}`}
            style={styles.pontoMeiaEstrela}
            onPress={() => setNota(i + 0.5)}
          >
            <Text style={styles.pontoTexto}>•</Text>
          </TouchableOpacity>
        );
      }
    }
    
    return estrelas;
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Cabeçalho */}
        <View style={styles.cabecalho}>
          <Text style={styles.tituloPrincipal}>Resenha</Text>
          <Text style={styles.subtitulo}>Escreva uma resenha</Text>
        </View>

        {/* Card do Álbum */}
        <View style={styles.cardAlbum}>
          <Text style={styles.albumTitulo}>{album.titulo}</Text>
          <Text style={styles.albumInfo}>{album.artista} • {album.ano}</Text>
          <Text style={styles.albumMusicas}>12 músicas</Text>
        </View>

        {/* Seção de Nota */}
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>De a sua nota</Text>
          
          {/* Estrelas Visuais - Versão Simples */}
          <View style={styles.estrelasContainer}>
            {renderEstrelasSimples()}
          </View>
          
          <Text style={styles.instrucoes}>
            Toque nas estrelas para nota inteira • Toque nos pontos para meia estrela
          </Text>
          
          {nota > 0 && (
            <Text style={styles.notaSelecionada}>
              Nota selecionada: {nota}/5
            </Text>
          )}
        </View>

        {/* Seção de Comentário */}
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Escreva aqui o que achou desse álbum...</Text>
          <TextInput
            style={styles.inputComentario}
            multiline
            numberOfLines={8}
            placeholder="Descreva sua experiência com este álbum, destaque faixas favoritas, produção musical, letras..."
            value={comentario}
            onChangeText={setComentario}
            textAlignVertical="top"
            placeholderTextColor="#999"
          />
        </View>

        {/* Botão Publicar */}
        <TouchableOpacity
          style={[
            styles.botaoPublicar,
            (nota === 0 || enviando) && styles.botaoPublicarDesabilitado
          ]}
          onPress={handlePublicar}
          disabled={nota === 0 || enviando}
        >
          <Text style={styles.botaoPublicarTexto}>
            {enviando ? 'Publicando...' : 'Publicar'}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  cabecalho: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 10,
  },
  tituloPrincipal: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 5,
  },
  subtitulo: {
    fontSize: 16,
    color: '#666666',
  },
  cardAlbum: {
    backgroundColor: '#F8F8F8',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  albumTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  albumInfo: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 2,
  },
  albumMusicas: {
    fontSize: 14,
    color: '#888888',
  },
  secao: {
    marginBottom: 30,
  },
  secaoTitulo: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 15,
  },
  // Estilos para estrelas
  estrelasContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  estrelaCheia: {
    fontSize: 40,
    color: '#FFD700', // Amarelo ouro
    marginHorizontal: 5,
  },
  estrelaVazia: {
    fontSize: 40,
    color: '#DDDDDD', // Cinza claro
    marginHorizontal: 5,
    opacity: 0.5,
  },
  pontoMeiaEstrela: {
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  pontoTexto: {
    fontSize: 20,
    color: '#666666',
    fontWeight: 'bold',
  },
  instrucoes: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
    marginTop: 5,
    fontStyle: 'italic',
  },
  // Estilos para versão complexa (com overlay)
  estrelaContainer: {
    position: 'relative',
    marginHorizontal: 5,
  },
  estrelaFundo: {
    fontSize: 40,
    color: '#DDDDDD',
    opacity: 0.5,
  },
  estrelaPreenchida: {
    fontSize: 40,
    color: '#FFD700',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  meiaEstrelaOverlay: {
    position: 'absolute',
    width: '50%',
    height: '100%',
    overflow: 'hidden',
  },
  // Estilos comuns
  notaSelecionada: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 10,
  },
  inputComentario: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    minHeight: 150,
    backgroundColor: '#FAFAFA',
    textAlignVertical: 'top',
    color: '#000000',
  },
  botaoPublicar: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  botaoPublicarDesabilitado: {
    backgroundColor: '#CCCCCC',
  },
  botaoPublicarTexto: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
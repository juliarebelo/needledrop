import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { AvaliacaoService } from '../../services/avaliacaoServices';

// Mock - substitua pela sua autenticação real depois
const USUARIO_ATUAL = {
  id: 'user-123',
  nome: 'Usuário Teste'
};

export default function ResenhaScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');
  const [carregando, setCarregando] = useState(false);

  // ✅ CORREÇÃO: Garantir que album.id seja string
  const album = {
    id: Array.isArray(params.albumId) ? params.albumId[0] : params.albumId || 'default-id',
    titulo: Array.isArray(params.titulo) ? params.titulo[0] : params.titulo || 'Álbum Desconhecido',
    artista: Array.isArray(params.artista) ? params.artista[0] : params.artista || 'Artista Desconhecido',
    ano: Array.isArray(params.ano) ? params.ano[0] : params.ano || '2020'
  };

  const handlePublicar = async () => {
    if (nota === 0) {
      Alert.alert('Atenção', 'Por favor, dê uma nota de 1 a 10!');
      return;
    }

    setCarregando(true);

    try {
      // ✅ CORREÇÃO: Agora album.id é garantidamente string
      await AvaliacaoService.salvarAvaliacao({
        usuario_id: USUARIO_ATUAL.id,
        album_id: album.id,
        nota: nota,
        comentario: comentario
      });

      Alert.alert('Sucesso', 'Resenha publicada com sucesso!');
      router.back();
    } catch (error) {
      console.error('Erro detalhado:', error);
      Alert.alert('Erro', 'Não foi possível publicar a resenha. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const renderBotoesNota = () => {
    return (
      <View style={styles.botoesContainer}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
          <TouchableOpacity
            key={num}
            style={[
              styles.botaoNota,
              nota === num ? styles.botaoSelecionado : styles.botaoNormal
            ]}
            onPress={() => setNota(num)}
          >
            <Text style={[
              styles.textoNota,
              nota === num ? styles.textoSelecionado : styles.textoNormal
            ]}>
              {num}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Resenha</Text>
        <Text style={styles.subtitulo}>Escreva uma resenha</Text>
      </View>

      <View style={styles.albumInfo}>
        <Text style={styles.albumNome}>{album.titulo}</Text>
        <Text style={styles.albumDetalhes}>{album.artista} • {album.ano}</Text>
      </View>

      <View style={styles.secao}>
        <Text style={styles.label}>De a sua nota</Text>
        {renderBotoesNota()}
        <Text style={styles.notaSelecionada}>
          {nota > 0 ? `Nota selecionada: ${nota}/10` : 'Selecione uma nota'}
        </Text>
      </View>

      <View style={styles.secao}>
        <Text style={styles.label}>Escreva aqui o que achou desse álbum...</Text>
        <TextInput
          style={styles.textarea}
          multiline
          numberOfLines={6}
          placeholder="Compartilhe sua opinião sobre as músicas, produção, letras..."
          value={comentario}
          onChangeText={setComentario}
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity
        style={[styles.botaoPublicar, (carregando || nota === 0) && styles.botaoDesabilitado]}
        onPress={handlePublicar}
        disabled={carregando || nota === 0}
      >
        {carregando ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.textoBotao}>Publicar</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.botaoCancelar} onPress={() => router.back()}>
        <Text style={styles.textoCancelar}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitulo: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  albumInfo: {
    backgroundColor: '#F8F8F8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 25,
  },
  albumNome: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  albumDetalhes: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  secao: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  botoesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  botaoNota: {
    width: '18%',
    aspectRatio: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  botaoNormal: {
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  botaoSelecionado: {
    backgroundColor: '#000',
  },
  textoNota: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  textoNormal: {
    color: '#333',
  },
  textoSelecionado: {
    color: '#FFF',
  },
  notaSelecionada: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 10,
  },
  textarea: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    minHeight: 120,
    backgroundColor: '#FAFAFA',
  },
  botaoPublicar: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  botaoDesabilitado: {
    backgroundColor: '#CCC',
  },
  textoBotao: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  botaoCancelar: {
    padding: 10,
    alignItems: 'center',
  },
  textoCancelar: {
    color: '#666',
    fontSize: 16,
  },
});
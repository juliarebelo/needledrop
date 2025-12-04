import { Feather } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

  import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FeatureSlider } from './_components/FeatureSlider';

const API_URL = process.env.EXPO_PUBLIC_ML_API_URL;

export default function Classificacao() {
  const router = useRouter();
  const [danceability, setDanceability] = useState(0);
  const [energy, setEnergy] = useState(0);
  const [valence, setValence] = useState(0);
  const [speechiness, setSpeechiness] = useState(0);
  const [instrumentalness, setInstrumentalness] = useState(0);
  const [classifying, setClassifying] = useState(false);
  type ResultType = {
    prediction: string;
    confidence: number;
    probabilities: Record<string, number>;
  };
  const [result, setResult] = useState<ResultType | null>(null);
  const [modelStatus, setModelStatus] = useState('loading');

  useEffect(() => {
    checkModelStatus();
  }, []);

  async function checkModelStatus() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(`${API_URL}/status`, { signal: controller.signal });
      clearTimeout(timeoutId);
      const data = await response.json();
      setModelStatus(data.model_loaded ? 'online' : 'offline');
    } catch (error) {
      setModelStatus('offline');
    }
  }

  const handleClassify = async () => {
    if (modelStatus !== 'online') {
      Alert.alert(
        'Modelo Offline',
        'O servidor de classificação não está rodando. Execute:\n\ncd analises\npython api_classificacao.py'
      );
      return;
    }

    setClassifying(true);
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/classify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          danceability,
          energy,
          valence,
          tempo: 120,
          loudness: -5,
          speechiness,
          acousticness: 0.3,
          instrumentalness,
          liveness: 0.1,
          duration_ms: 200000,
        }),
      });

      const data = await response.json();
      
      console.log('Resposta da classificação:', data);

      if (response.ok) {
        setResult(data);
      } else {
        Alert.alert('Erro', data.error || 'Falha na classificação');
      }
    } catch (error) {
      Alert.alert('Erro de Conexão', 'Não foi possível conectar à API. Certifique-se de que o servidor está rodando.');
      console.error('Erro na classificação:', error);
    } finally {
      setClassifying(false);
    }
  };

  const getColorForClass = (className: string) => {
    const lowerClass = className.toLowerCase();
    switch (lowerClass) {
      case 'baixa': return '#E74C3C';
      case 'média': 
      case 'media': return '#F39C12';
      case 'alta': return '#27AE60';
      default: return '#FFFFFF';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/homepage')} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Classificação de Música</Text>
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: modelStatus === 'online' ? '#27AE60' : '#E74C3C' }
          ]} />
          <Text style={styles.statusText}>
            {modelStatus === 'loading' ? 'Verificando...' : 
             modelStatus === 'online' ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoCard}>
          <Feather name="info" size={20} color="#ff0000ff" />
          <Text style={styles.infoText}>
            Ajuste os controles para prever a popularidade da música
          </Text>
        </View>

        <View style={styles.section}>
          <FeatureSlider
            label="Dançabilidade"
            value={danceability}
            onValueChange={setDanceability}
            min={0}
            max={0.1}
            step={0.001}
            color="#27AE60"
          />
          <FeatureSlider
            label="Energia"
            value={energy}
            onValueChange={setEnergy}
            min={0}
            max={0.1}
            step={0.001}
            color="#F39C12"
          />
          <FeatureSlider
            label="Tom Emocional"
            value={valence}
            onValueChange={setValence}
            min={0}
            max={0.1}
            step={0.001}
            color="#8B0000"
          />
          <FeatureSlider
            label="Vocal / Fala"
            value={speechiness}
            onValueChange={setSpeechiness}
            min={0}
            max={0.1}
            step={0.001}
            color="#2980B9"
          />
          <FeatureSlider
            label="Instrumental"
            value={instrumentalness}
            onValueChange={setInstrumentalness}
            min={0}
            max={0.1}
            step={0.001}
            color="#9B59B6"
          />
        </View>

        <TouchableOpacity
          style={[styles.classifyButton, classifying && styles.classifyButtonDisabled]}
          onPress={handleClassify}
          disabled={classifying || modelStatus !== 'online'}
        >
          {classifying ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.classifyButtonText}>Classificar</Text>
          )}
        </TouchableOpacity>

        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Resultado da Classificação</Text>
            <View style={[styles.predictionBadge, { backgroundColor: getColorForClass(result.prediction) }]}> 
              <Text style={styles.predictionText}>Popularidade: {result.prediction}</Text>
            </View>
            <Text style={styles.confidenceText}>
              Confiança: {(result.confidence * 100).toFixed(1)}%
            </Text>
            <View style={styles.probabilitiesContainer}>
              <Text style={styles.probabilitiesTitle}>Probabilidades:</Text>
              {Object.entries(result.probabilities).map(([className, prob]) => (
                <View key={className} style={styles.probabilityRow}>
                  <Text style={styles.probabilityLabel}>{className}:</Text>
                  <View style={styles.probabilityBarContainer}>
                    <View 
                      style={[
                        styles.probabilityBar, 
                        { 
                          width: `${Number(prob) * 100}%`,
                          backgroundColor: getColorForClass(className)
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.probabilityValue}>{(Number(prob) * 100).toFixed(1)}%</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {modelStatus === 'offline' && (
          <View style={styles.offlineCard}>
            <Feather name="alert-circle" size={24} color="#E74C3C" />
            <Text style={styles.offlineText}>
              Servidor offline. Execute no terminal:
            </Text>
            <View style={styles.codeBlock}>
              <Text style={styles.codeText}>cd analises</Text>
              <Text style={styles.codeText}>C:/Users/ASUS/needledrop/.venv/Scripts/python.exe api_classificacao.py</Text>
            </View>
            <View style={styles.debugInfo}>
              <Text style={styles.debugText}>Platform: {Platform.OS}</Text>
              <Text style={styles.debugText}>API URL: {API_URL}</Text>
              <Text style={styles.debugText}>Status: {modelStatus}</Text>
            </View>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={checkModelStatus}
            >
              <Feather name="refresh-cw" size={16} color="#FFFFFF" />
              <Text style={styles.retryButtonText}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#300505',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#4a1e1e',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#521a1aff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoText: {
    color: '#FFFFFF',
    marginLeft: 10,
    flex: 1,
    fontSize: 14,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#4a1e1e',
    color: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#6a2e2e',
  },
  classifyButton: {
    backgroundColor: '#ff0000ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 10,
    marginVertical: 20,
  },
  classifyButtonDisabled: {
    backgroundColor: '#666',
  },
  classifyButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center',
  },
  predictionBadge: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  predictionText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  confidenceText: {
    color: '#CCCCCC',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  probabilitiesContainer: {
    marginTop: 10,
  },
  probabilitiesTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  probabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  probabilityLabel: {
    color: '#CCCCCC',
    width: 60,
    fontSize: 14,
  },
  probabilityBarContainer: {
    flex: 1,
    height: 20,
    backgroundColor: '#333',
    borderRadius: 10,
    overflow: 'hidden',
    marginHorizontal: 10,
  },
  probabilityBar: {
    height: '100%',
    borderRadius: 10,
  },
  probabilityValue: {
    color: '#FFFFFF',
    width: 50,
    textAlign: 'right',
    fontSize: 14,
  },
  offlineCard: {
    backgroundColor: '#2a1010',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E74C3C',
    alignItems: 'center',
    marginTop: 20,
  },
  offlineText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 10,
  },
  codeBlock: {
    backgroundColor: '#1a0a0a',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    width: '100%',
  },
  codeText: {
    color: '#ff0000ff',
    fontFamily: 'monospace',
    fontSize: 12,
  },
  debugInfo: {
    backgroundColor: '#1a1a1a',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    width: '100%',
  },
  debugText: {
    color: '#00FF00',
    fontFamily: 'monospace',
    fontSize: 11,
    marginVertical: 2,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498DB',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  popularityHint: {
    backgroundColor: '#2C2C2C',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  hintText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
});

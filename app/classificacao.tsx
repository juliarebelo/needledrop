import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { theme } from '../constants/theme';
import { FeatureSlider } from './_components/FeatureSlider';
import { GlossarySection } from './_components/GlossarySection';
import { MetricInfo } from './_components/MetricInfo';

const API_URL = process.env.EXPO_PUBLIC_ML_API_URL;

type ResultType = {
  prediction: string;
  confidence: number;
  probabilities: Record<string, number>;
};

const METRICS = [
  {
    label: 'Dançabilidade',
    key: 'danceability' as const,
    color: '#27AE60',
    icon: 'music',
    description: 'Mede o quão adequada a música é para dançar',
    example: 'EDM (0.9), Clássico (0.2)',
    range: '0.0 - 1.0',
  },
  {
    label: 'Energia',
    key: 'energy' as const,
    color: '#F39C12',
    icon: 'zap',
    description: 'Representa a intensidade e atividade da faixa',
    example: 'Metal (0.9), Jazz (0.4)',
    range: '0.0 - 1.0',
  },
  {
    label: 'Tom Emocional',
    key: 'valence' as const,
    color: '#FF6B9D',
    icon: 'smile',
    description: 'Mede a positividade/felicidade da música',
    example: 'Pop alegre (0.8), Blues (0.3)',
    range: '0.0 - 1.0',
  },
  {
    label: 'Vocal / Fala',
    key: 'speechiness' as const,
    color: '#2980B9',
    icon: 'mic',
    description: 'Detecta a presença de palavras faladas',
    example: 'Rap (0.7), Clássico (0.1)',
    range: '0.0 - 1.0',
  },
  {
    label: 'Instrumental',
    key: 'instrumentalness' as const,
    color: '#9B59B6',
    icon: 'disc',
    description: 'Probabilidade de a faixa não conter vocais',
    example: 'Sinfonia (0.9), Pop vocal (0.1)',
    range: '0.0 - 1.0',
  },
];

export default function Classificacao() {
  const router = useRouter();
  const navigation = useNavigation<any>();
  const [metrics, setMetrics] = useState({
    danceability: 0.5,
    energy: 0.5,
    valence: 0.5,
    speechiness: 0.5,
    instrumentalness: 0.5,
  });
  const [textValues, setTextValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    METRICS.forEach((m) => {
      initial[m.key] = String(Math.round((metrics as any)[m.key] * 100));
    });
    return initial;
  });
  const [classifying, setClassifying] = useState(false);
  const [result, setResult] = useState<ResultType | null>(null);
  const [modelStatus, setModelStatus] = useState('loading');
  const [showGlossary, setShowGlossary] = useState(false);

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

  const handleMetricChange = (key: keyof typeof metrics, value: number) => {
    setMetrics((prev) => ({ ...prev, [key]: value }));
  };

  const parseMetricInput = (input: string): number | null => {
    if (!input) return null;
    const s = input.trim();
    if (s.endsWith('%')) {
      const n = parseFloat(s.slice(0, -1));
      if (isNaN(n)) return null;
      return Math.max(0, Math.min(1, n / 100));
    }
    const n = parseFloat(s);
    if (isNaN(n)) return null;
    if (n > 1 && n <= 100) return Math.max(0, Math.min(1, n / 100));
    return Math.max(0, Math.min(1, n));
  };

  const handleMetricTextChange = (key: string, text: string) => {
    setTextValues((prev) => ({ ...prev, [key]: text }));
  };

  const handleMetricTextEnd = (key: string) => {
    const txt = textValues[key];
    const parsed = parseMetricInput(txt);
    if (parsed === null) {
      setTextValues((prev) => ({ ...prev, [key]: String(Math.round((metrics as any)[key] * 100)) }));
      return;
    }
    setMetrics((prev) => ({ ...prev, [key]: parsed }));
    setTextValues((prev) => ({ ...prev, [key]: String(Math.round(parsed * 100)) }));
  };

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
      const payloadToSend = {
        danceability: metrics.danceability,
        energy: metrics.energy,
        valence: metrics.valence,
        speechiness: metrics.speechiness,
        instrumentalness: metrics.instrumentalness,
        // defaults sensatos para as demais features
        tempo: 110,
        loudness: -4,
        acousticness: 0.2,
        liveness: 0.15,
        duration_ms: 210000,
      };

      console.log('Enviando para API:', payloadToSend);

      const response = await fetch(`${API_URL}/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadToSend),
      });

      const data = await response.json();
      console.log('Resposta da API:', data);
      if (data?.input_features) {
        console.log('Input features usados pelo backend:', data.input_features);
      }

      if (response.ok) {
        setResult(data);
      } else {
        Alert.alert('Erro', data.error || 'Falha na classificação');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      Alert.alert('Erro de Conexão', 'Não foi possível conectar à API.');
    } finally {
      setClassifying(false);
    }
  };

  const getColorForClass = (className: string) => {
    const lower = className.toLowerCase();
    return lower.includes('alta') ? '#27AE60' :
           lower.includes('media') || lower.includes('média') ? '#F39C12' : '#E74C3C';
  };

  const getPopularityDescription = (prediction: string) => {
    const lower = prediction.toLowerCase();
    if (lower.includes('alta')) {
      return ' Esta música tem grande potencial de popularidade! Características de sucesso em streaming.';
    } else if (lower.includes('media') || lower.includes('média')) {
      return ' Popularidade moderada. A música tem bom potencial com ajustes nas métricas.';
    } else {
      return ' Popularidade baixa. Considere aumentar dançabilidade e energia para maior alcance.';
    }
  };

  const getSuggestions = (prediction: string) => {
    const lower = prediction.toLowerCase();
    if (lower.includes('baixa')) {
      return [
        '↑ Aumentar Dançabilidade (mínimo 0.6)',
        '↑ Aumentar Energia (mínimo 0.5)',
        '✓ Adicionar mais vocais'
      ];
    } else if (lower.includes('media') || lower.includes('média')) {
      return [
        '↑ Aumentar ligeiramente Dançabilidade',
        '✓ Manter Tom Emocional positivo',
        '↑ Elevar Energia para 0.7+',
      ];
    } else {
      return [
        '✓ Manter características atuais',
        '✓ Dançabilidade em nível ótimo',
        '✓ Energia bem balanceada',
      ];
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
          style={styles.menuButton}
        >
          <Feather name="menu" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preditor de Popularidade</Text>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor:
                  modelStatus === 'online' ? theme.colors.primary : '#E74C3C',
              },
            ]}
          />
          <Text style={styles.statusText}>
            {modelStatus === 'loading' ? '...' : modelStatus === 'online' ? '●' : '●'}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoCard}>
          <View style={styles.infoBadge}>
            <Feather name="info" size={24} color={theme.colors.primary} />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Análise de Popularidade</Text>
            <Text style={styles.infoText}>
              Use um modelo de ML para prever o potencial de sua música em plataformas de streaming
            </Text>
            <TouchableOpacity
              style={styles.glossaryToggle}
              onPress={() => setShowGlossary(!showGlossary)}
            >
              <Text style={styles.glossaryToggleText}>
                {showGlossary ? 'Ocultar' : 'Ver'} Glossário
              </Text>
              <Feather
                name={showGlossary ? 'chevron-up' : 'chevron-down'}
                size={14}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {showGlossary && <GlossarySection />}
        <View style={styles.metricsSection}>
          <Text style={styles.metricsTitle}> Ajuste as Métricas</Text>

          {METRICS.map((metric) => (
            <View key={metric.key} style={styles.metricCard}>
              <View style={styles.metricCardHeader}>
                <View style={[styles.metricIcon, { backgroundColor: metric.color + '20' }]}>
                  <Feather name={metric.icon as any} size={20} color={metric.color} />
                </View>
                <View style={styles.metricCardTitle}>
                  <Text style={styles.metricLabel}>{metric.label}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.metricPercentage}>
                      {(metrics[metric.key] * 100).toFixed(0)}%
                    </Text>

                    <TextInput
                      style={styles.metricInput}
                      value={textValues[metric.key]}
                      onChangeText={(t) => handleMetricTextChange(metric.key, t)}
                      onEndEditing={() => handleMetricTextEnd(metric.key)}
                      keyboardType="numeric"
                      returnKeyType="done"
                      placeholder="ex: 80"
                      placeholderTextColor={theme.colors.textSecondary}
                    />
                  </View>
                </View>
                <MetricInfo
                  label={metric.label}
                  description={metric.description}
                  example={metric.example}
                  range={metric.range}
                />
              </View>
              <FeatureSlider
                label=""
                value={metrics[metric.key]}
                onValueChange={(val) => {
                  handleMetricChange(metric.key, val);
                  setTextValues((prev) => ({ ...prev, [metric.key]: String(Math.round(val * 100)) }));
                }}
                min={0}
                max={1}
                step={0.01}
                color={metric.color}
              />
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.classifyButton,
            (classifying || modelStatus !== 'online') && styles.classifyButtonDisabled,
          ]}
          onPress={handleClassify}
          disabled={classifying || modelStatus !== 'online'}
        >
          {classifying ? (
            <ActivityIndicator color={theme.colors.text} size="small" />
          ) : (
            <>
              <Feather name="zap" size={20} color={theme.colors.text} />
              <Text style={styles.classifyButtonText}>Prever Agora</Text>
            </>
          )}
        </TouchableOpacity>

        {result && (
          <View style={styles.resultCard}>
            <View
              style={[
                styles.resultBadge,
                { backgroundColor: getColorForClass(result.prediction) },
              ]}
            >
              <Text style={styles.resultLabel}>RESULTADO</Text>
              <Text style={styles.resultValue}>{result.prediction}</Text>
              <Text style={styles.resultConfidence}>
                {(result.confidence * 100).toFixed(0)}% confiança
              </Text>
            </View>

            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionText}>
                {getPopularityDescription(result.prediction)}
              </Text>
            </View>

            <View style={styles.confidenceSection}>
              <Text style={styles.sectionLabel}>Certeza do Modelo</Text>
              <View style={styles.confidenceBar}>
                <View
                  style={[
                    styles.confidenceFill,
                    {
                      width: `${result.confidence * 100}%`,
                      backgroundColor: getColorForClass(result.prediction),
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.suggestionsSection}>
              <Text style={styles.sectionLabel}> Sugestões de Melhoria</Text>
              {getSuggestions(result.prediction).map((suggestion, index) => (
                <View key={index} style={styles.suggestionItem}>
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </View>
              ))}
            </View>

            <View style={styles.probabilitiesSection}>
              <Text style={styles.sectionLabel}> Probabilidades</Text>
              {Object.entries(result.probabilities).map(([className, prob]) => (
                <View key={className} style={styles.probabilityItem}>
                  <View style={styles.probabilityInfo}>
                    <Text style={styles.probabilityName}>{className}</Text>
                    <Text style={styles.probabilityPercent}>
                      {(Number(prob) * 100).toFixed(1)}%
                    </Text>
                  </View>
                  <View style={styles.probabilityBarWrapper}>
                    <View
                      style={[
                        styles.probabilityBar,
                        {
                          width: `${Number(prob) * 100}%`,
                          backgroundColor: getColorForClass(className),
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {modelStatus === 'offline' && !result && (
          <View style={styles.offlineCard}>
            <Feather name="alert-circle" size={32} color="#E74C3C" />
            <Text style={styles.offlineTitle}>Servidor Indisponível</Text>
            <Text style={styles.offlineText}>
              Execute o servidor localmente:
            </Text>
            <View style={styles.codeBlock}>
              <Text style={styles.codeText}>cd analises</Text>
              <Text style={styles.codeText}>python api_classificacao.py</Text>
            </View>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={checkModelStatus}
            >
              <Feather name="refresh-cw" size={16} color={theme.colors.text} />
              <Text style={styles.retryButtonText}>Verificar Novamente</Text>
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
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  infoBadge: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.md,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  infoText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.sm,
    lineHeight: 18,
    marginBottom: 10,
  },
  glossaryToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  glossaryToggleText: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.sm,
    fontWeight: '600',
    marginRight: 4,
  },
  metricsSection: {
    marginBottom: 20,
  },
  metricsTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  metricCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: theme.spacing.lg,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  metricCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  metricCardTitle: {
    flex: 1,
  },
  metricLabel: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
  },
  metricPercentage: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.sm,
    fontWeight: 'bold',
    marginTop: 2,
  },
  metricInput: {
    width: 70,
    marginLeft: 10,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: theme.fontSizes.sm,
  },
  classifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginVertical: 20,
    gap: 10,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  classifyButtonDisabled: {
    backgroundColor: theme.colors.textSecondary,
    opacity: 0.6,
  },
  classifyButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
  },
  resultCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  resultBadge: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  resultLabel: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.xs,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 8,
  },
  resultValue: {
    color: theme.colors.text,
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultConfidence: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.sm,
  },
  descriptionCard: {
    backgroundColor: theme.colors.background,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: 10,
  },
  descriptionText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.sm,
    lineHeight: 20,
  },
  confidenceSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  sectionLabel: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.md,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: theme.colors.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
  },
  suggestionsSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    marginBottom: 10,
  },
  suggestionText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.sm,
  },
  probabilitiesSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  probabilityItem: {
    marginBottom: 16,
  },
  probabilityInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  probabilityName: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.sm,
    fontWeight: '500',
  },
  probabilityPercent: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.sm,
    fontWeight: 'bold',
  },
  probabilityBarWrapper: {
    height: 6,
    backgroundColor: theme.colors.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  probabilityBar: {
    height: '100%',
  },
  offlineCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E74C3C',
    alignItems: 'center',
    marginTop: 20,
  },
  offlineTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  offlineText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.sm,
    textAlign: 'center',
    marginBottom: 12,
  },
  codeBlock: {
    backgroundColor: theme.colors.background,
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
    width: '100%',
  },
  codeText: {
    color: theme.colors.primary,
    fontFamily: 'monospace',
    fontSize: theme.fontSizes.sm,
    marginVertical: 2,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    gap: 6,
  },
  retryButtonText: {
    color: theme.colors.text,
    fontWeight: 'bold',
    fontSize: theme.fontSizes.sm,
  },
});
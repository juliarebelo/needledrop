import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { theme } from '../../constants/theme';

interface GlossaryItem {
  id: string;
  title: string;
  description: string;
  tips: string[];
}

const GLOSSARY_DATA: GlossaryItem[] = [
  {
    id: '1',
    title: 'Dançabilidade',
    description: 'Mede o quão adequada a música é para dançar, considerando fatores como estabilidade de tempo, consistência de ritmo e regularidade geral.',
    tips: [
      'Valores altos (0.7+): Músicas muito dançáveis (ex: EDM, House)',
      'Valores médios (0.4-0.7): Música bop moderada',
      'Valores baixos (<0.4): Menos apropriado para dançar (ex: Clássico)',
    ],
  },
  {
    id: '2',
    title: 'Energia',
    description: 'Representa a intensidade e atividade da faixa. Uma faixa energética é rápida, alta e barulhenta, enquanto uma faixa com baixa energia é lenta e calma.',
    tips: [
      'Valores altos: Músicas explosivas e dinâmicas',
      'Valores médios: Equilíbrio entre calma e intensidade',
      'Valores baixos: Músicas relaxantes e calmantes',
    ],
  },
  {
    id: '3',
    title: 'Tom Emocional (Valence)',
    description: 'Medida musical da positividade transmitida por uma faixa. Faixas com alta valência soam mais alegres e otimistas, enquanto baixa valência soa triste.',
    tips: [
      'Valores altos: Músicas alegres e otimistas',
      'Valores médios: Tom neutro ou melancólico',
      'Valores baixos: Músicas tristes ou sombrias',
    ],
  },
  {
    id: '4',
    title: 'Vocal / Fala (Speechiness)',
    description: 'Detecta a presença de palavras faladas em uma faixa. Valores altos indicam mais conteúdo de discurso falado.',
    tips: [
      'Valores altos (>0.66): Podcasts, audiobooks, rap com muito diálogo',
      'Valores médios (0.33-0.66): Música com vocais e efeitos de fala',
      'Valores baixos (<0.33): Principalmente instrumental ou vocais cantados',
    ],
  },
  {
    id: '5',
    title: 'Instrumentalidade',
    description: 'Prediz a probabilidade de uma faixa não conter vocais. Sons como "ooh" e "aah" são tratados como instrumentos nesta métrica.',
    tips: [
      'Valores altos: Principalmente instrumental (sem vocais)',
      'Valores médios: Mix de instrumental e vocais',
      'Valores baixos: Muito conteúdo vocal',
    ],
  },
];

export const GlossarySection = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const renderItem = ({ item }: { item: GlossaryItem }) => {
    const isExpanded = expandedId === item.id;

    return (
      <View style={styles.glossaryItem}>
        <TouchableOpacity
          style={styles.glossaryHeader}
          onPress={() => setExpandedId(isExpanded ? null : item.id)}
        >
          <View style={styles.titleContainer}>
            <Text style={styles.glossaryTitle}>{item.title}</Text>
          </View>
          <Feather
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={theme.colors.primary}
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.glossaryContent}>
            <Text style={styles.glossaryDescription}>{item.description}</Text>

            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}> Dicas:</Text>
              {item.tips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <Text style={styles.tipText}>• {tip}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Feather name="book" size={24} color={theme.colors.primary} />
        <Text style={styles.headerTitle}>Glossário de Métricas</Text>
      </View>
      <Text style={styles.headerSubtitle}>
        Entenda cada métrica técnica de música
      </Text>

      <FlatList
        data={GLOSSARY_DATA}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  headerSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginBottom: 15,
  },
  listContent: {
    paddingBottom: 10,
  },
  glossaryItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  glossaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  titleContainer: {
    flex: 1,
  },
  glossaryTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  glossaryContent: {
    paddingHorizontal: 15,
    paddingBottom: 15,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  glossaryDescription: {
    color: theme.colors.text,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  tipsContainer: {
    backgroundColor: theme.colors.background,
    padding: 10,
    borderRadius: 6,
  },
  tipsTitle: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tipItem: {
    marginBottom: 6,
  },
  tipText: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
  },
});
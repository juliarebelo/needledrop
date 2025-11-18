import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { GoalService } from '../../../services/goalService';
import { ProgressBar } from '../../_components/ProgressBar';
import { Goal } from '../../_types/Goal';

export default function MetasScreen() {
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadGoals();
    }, [])
  );

  const loadGoals = async () => {
    try {
      setLoading(true);
      const userGoals = await GoalService.getUserGoals();
      setGoals(userGoals);
    } catch (error) {
      console.error('Erro ao carregar metas:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadGoals();
    setRefreshing(false);
  }, []);

  const handleDeleteGoal = async (goal: Goal) => {
    Alert.alert(
      'Excluir Meta',
      'Tem certeza que deseja excluir esta meta?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            const success = await GoalService.deleteGoal(goal.id);
            if (success) {
              setGoals(goals.filter(g => g.id !== goal.id));
            }
          }
        }
      ]
    );
  };

  const handleIncrementProgress = async (goal: Goal) => {
    const updatedGoal = await GoalService.incrementProgress(goal.id);
    if (updatedGoal) {
      setGoals(goals.map(g => g.id === goal.id ? updatedGoal : g));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Carregando suas metas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Minhas Metas de Audição</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/criar-meta')}
        >
          <Feather name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <View style={styles.goalTitleContainer}>
                <Text style={styles.goalTitle}>{item.title}</Text>
                {GoalService.isGoalOverdue(item) && (
                  <View style={styles.overdueBadge}>
                    <Text style={styles.overdueText}>Atrasada</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => router.push(`/editar-meta?id=${item.id}`)}
                >
                  <Feather name="edit-2" size={18} color="#ff0000ff" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDeleteGoal(item)}
                >
                  <Feather name="trash-2" size={18} color="#dc2626" />
                </TouchableOpacity>
              </View>
            </View>

            {item.description && (
              <Text style={styles.goalDescription}>{item.description}</Text>
            )}

            <ProgressBar goal={item} />

            <View style={styles.goalFooter}>
              <View style={styles.deadlineContainer}>
                {item.deadline && (
                  <>
                    <Feather name="calendar" size={14} color="#6b7280" />
                    <Text style={styles.deadlineText}>
                      {formatDate(item.deadline)} 
                      {!GoalService.isGoalOverdue(item) && (
                        <Text style={styles.daysRemaining}>
                          {' '}({getDaysRemaining(item.deadline)} dias)
                        </Text>
                      )}
                    </Text>
                  </>
                )}
              </View>

              <TouchableOpacity 
                style={[
                  styles.incrementButton,
                  item.current_count >= item.target_count && styles.incrementButtonDisabled
                ]}
                onPress={() => handleIncrementProgress(item)}
                disabled={item.current_count >= item.target_count}
              >
                <Feather 
                  name="plus" 
                  size={16} 
                  color={item.current_count >= item.target_count ? "#9ca3af" : "#fff"} 
                />
                <Text style={[
                  styles.incrementText,
                  item.current_count >= item.target_count && styles.incrementTextDisabled
                ]}>
                  Concluir 1
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#FFFFFF']}
            tintColor="#FFFFFF"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="target" size={60} color="#666" />
            <Text style={styles.emptyTitle}>Nenhuma meta criada</Text>
            <Text style={styles.emptyText}>
              Crie sua primeira meta de audição para acompanhar seu progresso!
            </Text>
            <TouchableOpacity 
              style={styles.createFirstButton}
              onPress={() => router.push('/criar-meta')}
            >
              <Text style={styles.createFirstButtonText}>Criar Primeira Meta</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#300505',
    paddingTop: 60,
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
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#dc2626',
    padding: 12,
    borderRadius: 8,
  },
  listContainer: {
    padding: 20,
  },
  goalCard: {
    backgroundColor: '#4a1e1e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  goalTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  goalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  overdueBadge: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  overdueText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 4,
  },
  deleteButton: {
    padding: 4,
  },
  goalDescription: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 12,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deadlineText: {
    color: '#6b7280',
    fontSize: 12,
    marginLeft: 4,
  },
  daysRemaining: {
    color: '#16a34a',
    fontWeight: 'bold',
  },
  incrementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16a34a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  incrementButtonDisabled: {
    backgroundColor: '#374151',
  },
  incrementText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  incrementTextDisabled: {
    color: '#9ca3af',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  createFirstButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
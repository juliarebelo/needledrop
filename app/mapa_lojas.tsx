import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Stack, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { theme } from '../constants/theme';
import { supabase } from '../services/supabase';



interface Loja {
  id: string;
  nome: string;
  latitude: number;
  longitude: number;
  endereco?: string;
}


export default function MapaLojasScreen() {
  const [loading, setLoading] = useState(true);
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [newMarker, setNewMarker] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newNome, setNewNome] = useState('');
  const [newEndereco, setNewEndereco] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchMarker, setSearchMarker] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isPlacingMode, setIsPlacingMode] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editNome, setEditNome] = useState('');
  const [editEndereco, setEditEndereco] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const mapRef = useRef<MapView>(null);
  const isMountedRef = useRef(true);

  useFocusEffect(
    useCallback(() => {
      isMountedRef.current = true;
      return () => {
        isMountedRef.current = false;
      };
    }, [])
  );


  useEffect(() => {
      requestLocationPermission();
    fetchLojas();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setHasLocationPermission(true);
      } else {
        Alert.alert(
          'Permissão de Localização',
          'Para ver sua localização no mapa, é necessário permitir o acesso à localização.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão de localização:', error);
    }
  };

  const handleCancelAdd = () => {
    console.log('handleCancelAdd chamado - apenas ocultando overlay');
    try {
      setIsAddModalVisible(false);
      console.log('handleCancelAdd - overlay ocultado');
    } catch (error) {
      console.error('ERRO em handleCancelAdd:', error);
      Alert.alert('Erro', 'Erro ao fechar modal: ' + error);
    }
  };

  const handleCancelEdit = () => {
    console.log('handleCancelEdit chamado - apenas ocultando overlay');
    try {
      setIsEditModalVisible(false);
      console.log('handleCancelEdit - overlay ocultado');
    } catch (error) {
      console.error('ERRO em handleCancelEdit:', error);
      Alert.alert('Erro', 'Erro ao fechar modal: ' + error);
    }
  };

  const handleSaveLoja = async () => {
    if (!newMarker) return;
    if (!newNome.trim()) {
      Alert.alert('Nome obrigatório', 'Por favor, informe o nome da loja.');
      return;
    }
    try {
      const latStored = Math.round(newMarker.latitude * 10000000);
      const lonStored = Math.round(newMarker.longitude * 10000000);
      const { error } = await supabase.from('lojas').insert([
        {
          nome: newNome.trim(),
          latitude: latStored,
          longitude: lonStored,
          endereco: newEndereco.trim() || null,
        },
      ]);
      if (error) {
        console.error('Erro ao inserir loja:', error);
        Alert.alert('Erro', 'Não foi possível salvar a loja.');
        return;
      }
      await fetchLojas();
      handleCancelAdd();
    } catch (err) {
      console.error('Exceção ao salvar loja:', err);
      Alert.alert('Erro', 'Ocorreu um erro ao salvar a loja.');
    }
  };

  const handleSearch = async () => {
    const query = searchQuery.trim();
    if (query.length < 3) return;
    try {
      setSearching(true);
      const results = await Location.geocodeAsync(query);
      if (!results || results.length === 0) {
        Alert.alert('Não encontrado', 'Não conseguimos localizar esse endereço.');
        return;
      }
      const { latitude, longitude } = results[0];
      setSearchMarker({ latitude, longitude });
      const region: Region = {
        latitude,
        longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
      mapRef.current?.animateToRegion(region, 600);
    } catch (err) {
      console.error('Erro na busca geográfica:', err);
      Alert.alert('Erro', 'Ocorreu um erro ao buscar a localização.');
    } finally {
      setSearching(false);
    }
  };

  const clearSearchMarker = () => {
    setSearchMarker(null);
    setSearchQuery('');
  };

  const startPlacing = () => {
    setIsPlacingMode(true);
    setNewMarker(null);
    setIsAddModalVisible(false);
  };

  const handleTapOnMap = (e: any) => {
    if (!isPlacingMode) return;
    const coord = e?.nativeEvent?.coordinate;
    if (!coord) return;
    setNewMarker({ latitude: coord.latitude, longitude: coord.longitude });
    const region: Region = {
      latitude: coord.latitude,
      longitude: coord.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    mapRef.current?.animateToRegion(region, 500);
    setIsPlacingMode(false);
    setIsAddModalVisible(true);
  };

  const openEditLoja = (loja: Loja) => {
    setEditId(loja.id);
    setEditNome(loja.nome);
    setEditEndereco(loja.endereco || '');
    setIsEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editId) return;
    if (!editNome.trim()) {
      Alert.alert('Nome obrigatório', 'Por favor, informe o nome da loja.');
      return;
    }
    try {
      const { error } = await supabase
        .from('lojas')
        .update({ nome: editNome.trim(), endereco: editEndereco.trim() || null })
        .eq('id', editId);
      if (error) {
        console.error('Erro ao atualizar loja:', error);
        Alert.alert('Erro', 'Não foi possível atualizar a loja.');
        return;
      }
      await fetchLojas();
      setIsEditModalVisible(false);
      setEditId(null);
      setEditNome('');
      setEditEndereco('');
    } catch (err) {
      console.error('Exceção ao editar loja:', err);
      Alert.alert('Erro', 'Ocorreu um erro ao editar a loja.');
    }
  };

  const handleDeleteLoja = (loja: Loja) => {
    Alert.alert(
      'Excluir loja',
      `Deseja excluir "${loja.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => {} },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.from('lojas').delete().eq('id', loja.id);
              if (error) {
                console.error('Erro ao excluir loja:', error);
                Alert.alert('Erro', 'Não foi possível excluir a loja.');
                return;
              }
              await fetchLojas();
            } catch (err) {
              console.error('Exceção ao excluir loja:', err);
              Alert.alert('Erro', 'Ocorreu um erro ao excluir a loja.');
            }
          },
        },
      ]
    );
  };

  const fetchLojas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('lojas')
        .select('id, nome, latitude, longitude, endereco');


      if (error) {
        console.error('Erro ao buscar lojas:', error);
        setLojas(mockLojas);
      } else if (data && data.length > 0) {
        const lojasConvertidas = data.map(loja => ({
          ...loja,
          latitude: loja.latitude / 10000000,
          longitude: loja.longitude / 10000000
        }));
        setLojas(lojasConvertidas);
      } else {
        setLojas(mockLojas);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      setLojas(mockLojas);
    } finally {
      setLoading(false);
    }
  };


  const toggleExpand = () => {
    const toValue = isExpanded ? 0 : 1;
    Animated.timing(slideAnim, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsExpanded(!isExpanded);
  };

  const focusOnLoja = (loja: Loja) => {
    const region: Region = {
      latitude: loja.latitude,
      longitude: loja.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };


    mapRef.current?.animateToRegion(region, 1000);


    console.log(`Focando na loja: ${loja.nome}`);
  };


  const bottomSheetHeight = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['30%', '70%'],
  });


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }


  return (
    <>
      <Stack.Screen
        options={{
          title: 'Lojas de Disco em Recife',
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.colors.background,
          },

          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
            color: theme.colors.text,
          },
        }}
      />

      {isAddModalVisible && (
        <View style={styles.overlayFull}>
          <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.select({ ios: 'padding', android: undefined })}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Adicionar nova loja</Text>
              {newMarker && (
                <Text style={styles.modalSubtitle}>
                  {newMarker.latitude.toFixed(6)}, {newMarker.longitude.toFixed(6)}
                </Text>
              )}
              <TextInput
                placeholder="Nome da loja"
                placeholderTextColor={theme.colors.textSecondary}
                style={styles.input}
                value={newNome}
                onChangeText={setNewNome}
              />
              <TextInput
                placeholder="Endereço (opcional)"
                placeholderTextColor={theme.colors.textSecondary}
                style={[styles.input, styles.inputMultiline]}
                value={newEndereco}
                onChangeText={setNewEndereco}
                multiline
              />
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.button, styles.buttonSecondary]} 
                  onPress={handleCancelAdd}
                  activeOpacity={0.7}
                >
                  <Text style={styles.buttonSecondaryText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={handleSaveLoja}>
                  <Text style={styles.buttonPrimaryText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
          </View>
        </View>
      )}


      <View style={styles.container}>
        {isEditModalVisible && (
          <View style={styles.overlayFull}>
            <View style={styles.modalOverlay}>
              <KeyboardAvoidingView
                behavior={Platform.select({ ios: 'padding', android: undefined })}
                style={styles.modalContainer}
              >
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Editar loja</Text>
                  <TextInput
                    placeholder="Nome da loja"
                    placeholderTextColor={theme.colors.textSecondary}
                    style={styles.input}
                    value={editNome}
                    onChangeText={setEditNome}
                  />
                  <TextInput
                    placeholder="Endereço (opcional)"
                    placeholderTextColor={theme.colors.textSecondary}
                    style={[styles.input, styles.inputMultiline]}
                    value={editEndereco}
                    onChangeText={setEditEndereco}
                    multiline
                  />
                  <View style={styles.modalActions}>
                    <TouchableOpacity 
                      style={[styles.button, styles.buttonSecondary]} 
                      onPress={handleCancelEdit}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.buttonSecondaryText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={handleSaveEdit}>
                      <Text style={styles.buttonPrimaryText}>Salvar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </KeyboardAvoidingView>
            </View>
          </View>
        )}
        <View style={styles.searchBarContainer}>
          <View style={styles.searchBar}>
            <Feather name="map-pin" size={18} color={theme.colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar endereço ou local"
              placeholderTextColor={theme.colors.placeholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearchMarker} style={styles.iconButton}>
                <Feather name="x" size={18} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleSearch} style={styles.iconButton}>
              {searching ? (
                <ActivityIndicator size="small" color={theme.colors.textSecondary} />
              ) : (
                <Feather name="search" size={18} color={theme.colors.text} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: -8.047562,
            longitude: -34.877068,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
          showsUserLocation={hasLocationPermission}
          showsMyLocationButton={hasLocationPermission}
          onPress={handleTapOnMap}
        >
          {searchMarker && (
            <Marker
              coordinate={searchMarker}
              title="Resultado da busca"
              pinColor={theme.colors.accent}
            />
          )}
          {newMarker && (
            <Marker
              coordinate={newMarker}
              title="Nova loja"
              description="Posição selecionada"
              pinColor={theme.colors.primary}
            />
          )}
          {lojas && lojas.length > 0 && lojas.map((loja) => (
            <Marker
              key={loja.id}
              coordinate={{
                latitude: loja.latitude,
                longitude: loja.longitude,
              }}
              title={loja.nome}
              description={loja.endereco || 'Endereço não disponível'}
            />
          ))}
        </MapView>


        <Animated.View style={[styles.bottomSheet, { height: bottomSheetHeight }]}>
          <TouchableOpacity
            style={styles.bottomSheetHandle}
            onPress={toggleExpand}
          >
            <View style={styles.handleBar} />
            <Text style={styles.bottomSheetTitle}>
              Lojas de Disco ({lojas.length})
            </Text>
            <Feather
              name={isExpanded ? 'chevron-down' : 'chevron-up'}
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>


          <FlatList
            data={lojas}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.lojaItem}
                onPress={() => focusOnLoja(item)}
              >
                <View style={styles.lojaInfo}>
                  <Text style={styles.lojaNome}>{item.nome}</Text>
                  {item.endereco && (
                    <View style={styles.infoRow}>
                      <Feather
                        name="map-pin"
                        size={14}
                        color={theme.colors.textSecondary}
                      />
                      <Text style={styles.lojaEndereco}>{item.endereco}</Text>
                    </View>
                  )}
                  <Text style={styles.lojaCoords}>
                    {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
                  </Text>
                </View>
                <View style={styles.actionsRow}>
                  <TouchableOpacity onPress={() => focusOnLoja(item)} style={styles.actionIcon}>
                    <Feather name="navigation" size={20} color={theme.colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => openEditLoja(item)} style={styles.actionIcon}>
                    <Feather name="edit-2" size={18} color={theme.colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteLoja(item)} style={styles.actionIcon}>
                    <Feather name="trash-2" size={18} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
            scrollEnabled={isExpanded}
            nestedScrollEnabled={true}
          />
        </Animated.View>

        {isPlacingMode && (
          <View style={styles.placementHint}>
            <Feather name="info" size={16} color={theme.colors.text} />
            <Text style={styles.placementHintText}>Toque no mapa para escolher a localização</Text>
          </View>
        )}

        <TouchableOpacity style={styles.fab} onPress={startPlacing} activeOpacity={0.8}>
          <Feather name="plus" size={22} color={'#fff'} />
          <Text style={styles.fabText}>Adicionar loja</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}


const mockLojas: Loja[] = [
  {
    id: '1',
    nome: 'Disco Clássico',
    latitude: -8.047562,
    longitude: -34.877068,
    endereco: 'Rua da Aurora, 123 - Recife',
  },
  {
    id: '2',
    nome: 'Vinil Retro',
    latitude: -8.055555,
    longitude: -34.885555,
    endereco: 'Av. Getúlio Vargas, 456 - Boa Vista',
  },
  {
    id: '3',
    nome: 'Som & Memória',
    latitude: -8.062222,
    longitude: -34.871111,
    endereco: 'Rua 7 de Setembro, 789 - Santo Antônio',
  },
];


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  map: {
    flex: 1,
  },
  searchBarContainer: {
    position: 'absolute',
    top: 8,
    left: 12,
    right: 12,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    color: theme.colors.text,
  },
  iconButton: {
    marginLeft: theme.spacing.sm,
    padding: theme.spacing.xs,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 0,
  },
  bottomSheetHandle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.textSecondary,
    borderRadius: 2,
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    left: '50%',
    marginLeft: -20,
  },
  bottomSheetTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    flex: 1,
    marginTop: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  actionIcon: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
  lojaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  lojaInfo: {
    flex: 1,
  },
  lojaNome: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.md,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  lojaEndereco: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.sm,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  lojaCoords: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.xs,
    marginTop: theme.spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContainer: {
    width: '100%',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    width: '90%',
    maxWidth: 420,
  },
  modalTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
  },
  modalSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.sm,
    marginBottom: theme.spacing.md,
  },
  input: {
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.sm,
  },
  button: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: 8,
  },
  buttonPrimary: {
    backgroundColor: theme.colors.primary,
  },
  buttonPrimaryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonSecondary: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  buttonSecondaryText: {
    color: theme.colors.text,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 28,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    gap: 8,
  },
  fabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  placementHint: {
    position: 'absolute',
    top: 60,
    left: 12,
    right: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  placementHintText: {
    color: theme.colors.text,
  },
  overlayFull: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});

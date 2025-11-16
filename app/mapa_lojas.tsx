import { Feather } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  StyleSheet,
  Text,
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
  const [isExpanded, setIsExpanded] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const mapRef = useRef<MapView>(null);


  useEffect(() => {
    fetchLojas();
  }, []);


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


      <View style={styles.container}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: -8.047562,
            longitude: -34.877068,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
          showsUserLocation={false}
        >
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
                <Feather
                  name="navigation"
                  size={20}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            )}
            scrollEnabled={isExpanded}
            nestedScrollEnabled={true}
          />
        </Animated.View>
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
});

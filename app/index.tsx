import { Link } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <Image
         source={require('../assets/images/darkside.png')}
          style={styles.albumImage}
        />
      </View>

      <View style={styles.bottomContainer}>
        <Text style={styles.brandName}>
          Needle<Text style={styles.brandNameBold}>Drop</Text>
        </Text>

        {/* Botão de Iniciar */}
        <Link href="/login" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Iniciar</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <Image
        source={require('../assets/images/vinil.png')}
        style={styles.vinylImage}
      />
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topContainer: {
    height: '55%',
    backgroundColor: 'black',
  },
  albumImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover', // << VÍRGULA ADICIONADA
  }, // << CERTIFIQUE-SE DE FECHAR O OBJETO AQUI
  bottomContainer: {
    flex: 1,
    backgroundColor: '#D3D3D3',
    alignItems: 'center',
  },
  vinylImage: {
    position: 'absolute',
    width: 120,
    height: 120,
    top: '49%',
    alignSelf: 'center',
  },
  brandName: {
    marginTop: 80,
    fontSize: 36,
    color: '#8B0000',
  },
  brandNameBold: {
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#000000',
    paddingVertical: 15,
    paddingHorizontal: 70,
    borderRadius: 30,
    position: 'absolute',
    bottom: 60,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
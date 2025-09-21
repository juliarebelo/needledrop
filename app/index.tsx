import { Link } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WelcomeScreen() {
  return (
    // O container principal que ocupa a tela inteira.
    <View style={styles.container}>

      {/* View para a imagem superior */}
      <View style={styles.topContainer}>
        <Image
         source={require('../assets/images/darkside.png')}
          style={styles.albumImage}
        />
      </View>

      {/* View para o conteúdo inferior (a parte cinza) */}
      <View style={styles.bottomContainer}>
        {/* O logo "NeedleDrop" */}
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

      {/* Imagem do Vinil - Posicionada de forma absoluta para ficar por cima */}
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
    height: '55%', // A parte de cima ocupa 55% da tela
    backgroundColor: 'black',
  },
  albumImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover', // Garante que a imagem cubra todo o espaço
  },
  bottomContainer: {
    flex: 1, // Ocupa o resto do espaço
    backgroundColor: '#D3D3D3', // Fundo cinza claro
    alignItems: 'center', // Centraliza o conteúdo horizontalmente
  },
  vinylImage: {
    // Posicionamento absoluto é a chave aqui!
    position: 'absolute',
    width: 120, // Ajuste o tamanho conforme necessário
    height: 120, // Ajuste o tamanho conforme necessário
    // Cálculo para centralizar o vinil na divisa
    top: '49%', // Começa um pouco antes da metade da tela
    alignSelf: 'center', // Centraliza horizontalmente
  },
  brandName: {
    marginTop: 80, // Distância do topo para dar espaço ao vinil
    fontSize: 36,
    color: '#8B0000', // Um tom de vermelho escuro
  },
  brandNameBold: {
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#000000', // Fundo preto
    paddingVertical: 15,
    paddingHorizontal: 70,
    borderRadius: 30,
    position: 'absolute', // Posiciona o botão na parte de baixo
    bottom: 60, // Distância da parte inferior da tela
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, ImageBackground, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
    const router = useRouter();
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            <ImageBackground
                source={require('../assets/images/login-background.png')}
                style={styles.topContainer}
                imageStyle={{ opacity: 0.6 }}>
            </ImageBackground>

            <Image 
                source={require('../assets/images/vinil.png')}
                style={styles.vinylImage}
            />

            <View style={styles.bottomContainer}>
                <Text style={styles.title}>Login</Text>
                <Text style={styles.subtitle}>Entre para prosseguir</Text>

                {/*entrada do usuário*/}
                <View style={styles.inputContainer}>
                    <Feather name="user" size={20} color="#888" style={styles.inputIcon} />
                    <TextInput
                        placeholder="Usuário"
                        style={styles.input}
                        placeholderTextColor="#888"
                    />
                </View>

                {/*entrada da senha*/}
                <View style={styles.inputContainer}>
                    <Feather name="lock" size={20} color="#888" style={styles.inputIcon} />
                    <TextInput
                        placeholder="Senha"
                        style={styles.input}
                        placeholderTextColor="#888"
                        secureTextEntry // para esconder a senha
                    />
                </View>

                <TouchableOpacity>
                    <Text style={styles.forgotPassword}>Esqueceu a senha?</Text>
                </TouchableOpacity>

                {/* Botão de Login */}
                <TouchableOpacity style={styles.loginButton}>
                    <Text style={styles.loginButtonText}>Login</Text>
                </TouchableOpacity>

                {/* Link para a tela de registro */}
                <View style={styles.signupContainer}>
                    <Text style={styles.signupText}>Não tem uma conta?</Text>
                    <TouchableOpacity onPress={() => router.push('/cadastro')}>
                        <Text style={[styles.signupText, styles.signupLink]}> Cadastre-se aqui</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D9D9D9',
  },
  topContainer: {
    height: '35%',
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vinylImage: {
    width: 130,
    height: 130,
    borderRadius: 65,
    position: 'absolute',
    alignSelf: 'center',
    top: '28%',
    zIndex: 1,
  },
  bottomContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 80,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#c4c5c5',
    borderRadius: 15,
    width: '100%',
    height: 50,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    color: '#555',
    fontSize: 12,
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#8b0000',
    paddingVertical: 15,
    borderRadius: 15,
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
  },
  signupText: {
    color: '#555',
    fontSize: 12,
  },
  signupLink: {
    fontWeight: 'bold',
    color: '#8b0000',
  },
});
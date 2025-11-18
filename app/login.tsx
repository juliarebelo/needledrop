import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ImageBackground, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../services/supabase';

export default function LoginScreen() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erroEmail, setErroEmail] = useState('');
    const [erroSenha, setErroSenha] = useState('');
    const [loading, setLoading] = useState(false);
    
    const handleLogin = async () => {
        setErroEmail('');
        setErroSenha('');
        let formValido = true;

        if (!email) {
            setErroEmail('O email é obrigatório.');
            formValido = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setErroEmail('O email é inválido.');
            formValido = false;
        }

        if (!senha) {
            setErroSenha('A senha é obrigatória.');
            formValido = false;
        }

        if (!formValido) return;
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: senha,
            });

            if (error) {
                Alert.alert('Erro no login', error.message);
                return;
            }

            if (data.user) {
                router.replace('/(tabs)/homepage');
            }

        } catch (error) {
            Alert.alert('Erro', 'Ocorreu um erro inesperado. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            <ImageBackground
                source={require('../assets/images/login-background.png')}
                style={styles.topContainer}
                resizeMode="cover"
                imageStyle={styles.backgroundImageStyle}>
            </ImageBackground>

            <Image 
                source={require('../assets/images/vinil.png')}
                style={styles.vinylImage}
            />

            <View style={styles.bottomContainer}>
                <Text style={styles.title}>Login</Text>
                <Text style={styles.subtitle}>Entre para prosseguir</Text>

                <View style={styles.inputContainer}>
                    <Feather name="mail" size={20} color="#888" style={styles.inputIcon} />
                    <TextInput
                        placeholder="Email"
                        style={styles.input}
                        placeholderTextColor="#888"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address" 
                        autoCapitalize="none"
                    />
                </View>

                {erroEmail ? <Text style={styles.errorText}>{erroEmail}</Text> : null}

                <View style={styles.inputContainer}>
                    <Feather name="lock" size={20} color="#888" style={styles.inputIcon} />
                    <TextInput
                        placeholder="Senha"
                        style={styles.input}
                        placeholderTextColor="#888"
                        secureTextEntry
                        value={senha}
                        onChangeText={setSenha}
                    />
                </View>

                 {erroSenha ? <Text style={styles.errorText}>{erroSenha}</Text> : null}

                <TouchableOpacity onPress={() => router.push('/senhas')}>
                    <Text style={styles.forgotPassword}>Esqueceu a senha?</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.loginButton, loading && styles.disabledButton]} 
                    onPress={handleLogin}
                    disabled={loading}
                >
                    <Text style={styles.loginButtonText}>
                        {loading ? 'Entrando...' : 'Login'}
                    </Text>
                </TouchableOpacity>
                
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
    width: '100%',
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImageStyle: {
    width: '100%',
    height: '100%',
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
  errorText: {
    color: '#8b0000',
    fontSize: 12,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    width: '100%',
    marginTop: -10, 
    marginBottom: 10,
    paddingLeft: 5, 
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
  disabledButton: {
    opacity: 0.7,
  },
});
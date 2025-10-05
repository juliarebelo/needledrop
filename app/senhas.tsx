import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ImageBackground, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Caminhos das imagens (ajuste se necessário)
const LOGIN_BACKGROUND = require('../assets/images/login-background.png');
const VINYL_IMAGE = require('../assets/images/vinil.png');

export default function SenhasScreen() {
    const router = useRouter();

    // Estados para os campos e erros
    const [email, setEmail] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmaSenha, setConfirmaSenha] = useState('');
    const [erroEmail, setErroEmail] = useState('');
    const [erroNovaSenha, setErroNovaSenha] = useState('');
    const [erroConfirmaSenha, setErroConfirmaSenha] = useState('');
    const [loading, setLoading] = useState(false);

    // Função para lidar com a redefinição de senha
    const handleRedefinirSenha = () => {
        setErroEmail('');
        setErroNovaSenha('');
        setErroConfirmaSenha('');
        let formValido = true;

        if (loading) return;

        // Validação de E-mail
        if (!email) {
            setErroEmail('O email é obrigatório.');
            formValido = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setErroEmail('O email é inválido.');
            formValido = false;
        }

        // Validação de Nova Senha
        if (!novaSenha || novaSenha.length < 6) {
            setErroNovaSenha('A nova senha deve ter no mínimo 6 caracteres.');
            formValido = false;
        }

        // Validação de Confirmação de Senha
        if (novaSenha !== confirmaSenha) {
            setErroConfirmaSenha('As senhas não coincidem.');
            formValido = false;
        } else if (!confirmaSenha) {
             setErroConfirmaSenha('A confirmação da senha é obrigatória.');
             formValido = false;
        }

        if (formValido) {
            setLoading(true);
            // Simulação de chamada de API/Backend (Ação de redefinição real)
            setTimeout(() => {
                setLoading(false);
                Alert.alert('Sucesso', 'Sua senha foi redefinida com sucesso! Por favor, faça login.');
                // Após o sucesso, retorna para a tela de login
                router.push('/');
            }, 1500);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            <ImageBackground
                source={LOGIN_BACKGROUND}
                style={styles.topContainer}
                resizeMode="cover"
                imageStyle={styles.backgroundImageStyle}>
            </ImageBackground>

            <Image 
                source={VINYL_IMAGE}
                style={styles.vinylImage}
            />

            <View style={styles.bottomContainer}>
                <Text style={styles.title}>Redefinir Senha</Text>
                <Text style={styles.subtitle}>Defina uma nova senha</Text>

                {/* Entrada do E-mail */}
                <View style={styles.inputContainer}>
                    <Feather name="mail" size={20} color="#888" style={styles.inputIcon} />
                    <TextInput
                        placeholder="E-mail"
                        style={styles.input}
                        placeholderTextColor="#888"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address" 
                        autoCapitalize="none"
                    />
                </View>
                {erroEmail ? <Text style={styles.errorText}>{erroEmail}</Text> : null}

                {/* Entrada da Nova Senha */}
                <View style={styles.inputContainer}>
                    <Feather name="lock" size={20} color="#888" style={styles.inputIcon} />
                    <TextInput
                        placeholder="Nova senha"
                        style={styles.input}
                        placeholderTextColor="#888"
                        secureTextEntry
                        value={novaSenha}
                        onChangeText={setNovaSenha}
                    />
                </View>
                 {erroNovaSenha ? <Text style={styles.errorText}>{erroNovaSenha}</Text> : null}

                {/* Entrada da Confirmação de Senha */}
                <View style={styles.inputContainer}>
                    <Feather name="lock" size={20} color="#888" style={styles.inputIcon} />
                    <TextInput
                        placeholder="Confirmar senha"
                        style={styles.input}
                        placeholderTextColor="#888"
                        secureTextEntry
                        value={confirmaSenha}
                        onChangeText={setConfirmaSenha}
                    />
                </View>
                 {erroConfirmaSenha ? <Text style={styles.errorText}>{erroConfirmaSenha}</Text> : null}

                {/* Botão de Redefinir */}
                <TouchableOpacity 
                    style={styles.redefinirButton} 
                    onPress={handleRedefinirSenha} 
                    disabled={loading}
                >
                    {loading ? (
                        <Text style={styles.redefinirButtonText}>Redefinindo...</Text>
                    ) : (
                        <Text style={styles.redefinirButtonText}>Redefinir</Text>
                    )}
                </TouchableOpacity>
                
                {/* Link para voltar ao Login */}
                <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>Lembrou da senha?</Text>
                    <TouchableOpacity onPress={() => router.push('/')}>
                        <Text style={[styles.loginText, styles.loginLink]}> Faça Login</Text>
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
  redefinirButton: {
    backgroundColor: '#8b0000',
    paddingVertical: 15,
    borderRadius: 15,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  redefinirButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
  },
  loginText: {
    color: '#555',
    fontSize: 12,
  },
  loginLink: {
    fontWeight: 'bold',
    color: '#8b0000',
  },
});

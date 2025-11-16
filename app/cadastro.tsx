import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ImageBackground, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../services/supabase';

export default function CadastroScreen() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [erroEmail, setErroEmail] = useState('');
    const [erroSenha, setErroSenha] = useState('');
    const [erroConfirmarSenha, setErroConfirmarSenha] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCadastro = async () => {
        setErroEmail('');
        setErroSenha('');
        setErroConfirmarSenha('');
        
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
        } else if (senha.length < 6) {
            setErroSenha('A senha deve ter pelo menos 6 caracteres.');
            formValido = false;
        }

        if (!confirmarSenha) {
            setErroConfirmarSenha('A confirmação de senha é obrigatória.');
            formValido = false;
        } else if (senha !== confirmarSenha) {
            setErroConfirmarSenha('As senhas não coincidem.');
            formValido = false;
        }

        if (!formValido) return;

        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: senha,
            });

            if (error) {
                Alert.alert('Erro no cadastro', error.message);
                return;
            }

            if (data.user) {
                Alert.alert('Sucesso', 'Cadastro realizado com sucesso! Verifique seu email para confirmação.');
                router.push('/');
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
                <Text style={styles.title}>Cadastro</Text>
                <Text style={styles.subtitle}>Crie sua conta</Text>

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

                <View style={styles.inputContainer}>
                    <Feather name="lock" size={20} color="#888" style={styles.inputIcon} />
                    <TextInput
                        placeholder="Confirmar Senha"
                        style={styles.input}
                        placeholderTextColor="#888"
                        secureTextEntry
                        value={confirmarSenha}
                        onChangeText={setConfirmarSenha}
                    />
                </View>

                {erroConfirmarSenha ? <Text style={styles.errorText}>{erroConfirmarSenha}</Text> : null}

                <TouchableOpacity 
                    style={[styles.cadastroButton, loading && styles.disabledButton]} 
                    onPress={handleCadastro}
                    disabled={loading}
                >
                    <Text style={styles.cadastroButtonText}>
                        {loading ? 'Cadastrando...' : 'Cadastrar'}
                    </Text>
                </TouchableOpacity>
                
                <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>Já tem uma conta?</Text>
                    <TouchableOpacity onPress={() => router.push('/')}>
                        <Text style={[styles.loginText, styles.loginLink]}> Faça login aqui</Text>
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
  cadastroButton: {
    backgroundColor: '#8b0000',
    paddingVertical: 15,
    borderRadius: 15,
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  cadastroButtonText: {
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
  disabledButton: {
    opacity: 0.7,
  },
});
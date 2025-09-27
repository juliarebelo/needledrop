// homepage.tsx
import { Feather, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { useRouter } from 'expo-router';
import { Image, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';

export default function Homepage() {
    const router = useRouter(); // Inicializa o useRouter aqui

    // Dados simulados para as playlists
    const playlists = [
        { name: 'Dirigindo', image: require('../assets/images/playlist1.jpg') }, // Substitua pelo seu caminho de imagem real
        { name: '2000\'s', image: require('../assets/images/playlist2.jpg') },    // Substitua pelo seu caminho de imagem real
        { name: 'Relaxar', image: require('../assets/images/playlist3.jpg') },   // Substitua pelo seu caminho de imagem real
    ];

    // O código abaixo usa imagens simuladas que você precisará adicionar à sua pasta assets/images
    // Para replicar a imagem fielmente, você precisará adicionar as imagens:
    // - playlist1.jpg (pôr do sol no carro)
    // - playlist2.jpg (pilha de CDs)
    // - playlist3.jpg (botão ON/OFF "music: ON world: OFF")
    // - avatar.jpg (foto de perfil)
    
    // Se você não tiver as imagens, substitua o 'require' por qualquer imagem de placeholder que você tenha,
    // ou comente a linha 'image' e use um View com background para testar a estrutura.

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={styles.container.backgroundColor} />

            {/* Cabeçalho */}
            <View style={styles.header}>
                <Text style={styles.pageTitle}>Homepage</Text>
                
                {/* Saudação e Avatar */}
                <View style={styles.userInfo}>
                    <View>
                        <Text style={styles.greeting}>Olá, Duda!</Text>
                        <Text style={styles.subtitle}>Avalie uma nova música...</Text>
                    </View>
                    <Image
                        source={require('../assets/images/avatar.jpg')} // Substitua pelo seu caminho de imagem real
                        style={styles.avatar}
                    />
                     {/* Círculo de notificação, se houver */}
                    <View style={styles.notificationDot} />
                </View>

                {/* Barra de Pesquisa */}
                <View style={styles.searchContainer}>
                    <TextInput
                        placeholder="buscar novas músicas"
                        placeholderTextColor="#aaa"
                        style={styles.searchInput}
                    />
                    <TouchableOpacity style={styles.searchButton}>
                        <Feather name="search" size={24} color="#333" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                
                <Text style={styles.playlistsTitle}>Minhas Playlists</Text>
                
                {/* Playlists */}
                <View style={styles.playlistsContainer}>
                    {playlists.map((playlist, index) => (
                        <TouchableOpacity key={index} style={styles.playlistCard}>
                            <Image source={playlist.image} style={styles.playlistImage} />
                            <Text style={styles.playlistName}>{playlist.name}</Text>
                        </TouchableOpacity>
                    ))}
                    {/* Placeholder para alinhamento se necessário, ou remova se preferir um ScrollView horizontal */}
                    <View style={styles.playlistCardPlaceholder} /> 
                </View>

                {/* Conteúdo adicional da Home pode vir aqui... */}
                
            </ScrollView>

            {/* Barra de Navegação Inferior (Recriação simples) */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem}>
                    <Feather name="home" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <MaterialCommunityIcons name="album" size={24} color="#888" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Feather name="bell" size={24} color="#888" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Feather name="user" size={24} color="#888" />
                </TouchableOpacity>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#400000', // Cor de fundo principal mais escura
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 50, // Ajuste para a barra de status
        paddingBottom: 20,
    },
    pageTitle: {
        color: '#fff',
        fontSize: 14,
        opacity: 0.8,
        marginBottom: 10,
    },
    userInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    subtitle: {
        fontSize: 14,
        color: '#ccc',
    },
    avatar: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        borderWidth: 2,
        borderColor: '#fff',
    },
    notificationDot: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'red',
        zIndex: 1,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 25,
        height: 50,
        paddingLeft: 20,
        marginBottom: 20,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    searchButton: {
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 25,
        margin: 5,
    },
    content: {
        paddingHorizontal: 20,
    },
    playlistsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 15,
    },
    playlistsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    playlistCard: {
        width: '30%', // Ajuste para caber 3 por linha com algum espaçamento
        marginBottom: 20,
        alignItems: 'center',
    },
    playlistCardPlaceholder: {
        width: '30%',
    },
    playlistImage: {
        width: '100%',
        height: 100, // Altura fixa
        borderRadius: 10,
        marginBottom: 5,
    },
    playlistName: {
        color: '#fff',
        fontSize: 12,
        textAlign: 'center',
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#550000', // Linha sutil para separar
    },
    navItem: {
        padding: 10,
    }
});
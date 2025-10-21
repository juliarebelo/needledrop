import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ImageBackground, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Caminhos das imagens CORRIGIDOS - usando URLs online
const LOGIN_BACKGROUND = "https://placehold.co/400x200/300505/ffffff?text=NeedleDrop+Background";
const DEFAULT_PROFILE_PIC = "https://placehold.co/128x128/300505/ffffff?text=UFRPE";
const PLACEHOLDER_ALBUM = "https://placehold.co/80x80/666666/ffffff?text=ALBUM";

// Tipagem básica do Álbum Favorito
interface Album {
    id: string;
    coverUrl: string;
    title: string;
}

// Tipagem básica do Perfil
interface Profile {
    id: string;
    nomeCompleto: string;
    username: string;
    bio: string;
    fotoUrl: string;
    headerUrl: string;
    albunsFavoritos: Album[];
}

// MOCK DATA - Dados fictícios que substituem o Firebase
const MOCK_PROFILE: Profile = {
    id: 'meu_perfil',
    nomeCompleto: 'Julia Rebelo',
    username: 'juliarebelo',
    bio: 'Music enthusiast • Needledrop lover • Album collector',
    fotoUrl: 'https://placehold.co/128x128/8b0000/ffffff?text=JR',
    headerUrl: LOGIN_BACKGROUND,
    albunsFavoritos: [
        {
            id: '1',
            coverUrl: 'https://placehold.co/80x80/1a1a1a/ffffff?text=TPAB',
            title: 'To Pimp a Butterfly'
        },
        {
            id: '2',
            coverUrl: 'https://placehold.co/80x80/2c2c2c/ffffff?text=Blonde',
            title: 'Blonde'
        },
        {
            id: '3',
            coverUrl: 'https://placehold.co/80x80/333366/ffffff?text=Kid+A',
            title: 'Kid A'
        }
    ]
};

// VERSÃO MAIS SIMPLES - SEM TIPAGEM COMPLEXA
const AlbumItem = ({ album, index, onRemove }: { 
    album: Album; 
    index: number; 
    onRemove: (index: number) => void;
}) => (
    <View style={albumStyles.albumContainer}>
        <Image 
            source={{ uri: album.coverUrl }}
            style={albumStyles.albumCover}
        />
        <TouchableOpacity style={albumStyles.removeButton} onPress={() => onRemove(index)}>
            <Feather name="x" size={14} color="#FFF" />
        </TouchableOpacity>
    </View>
);

export default function ProfileScreen() {
    const router = useRouter();
    const [profile, setProfile] = useState<Partial<Profile>>(MOCK_PROFILE);
    const [isSaving, setIsSaving] = useState(false);
    
    // Constante para o limite de álbuns
    const MAX_ALBUMS = 4;

    // ----------------------------------------------------------------------
    // 2. HANDLERS PARA FUNCIONALIDADES ESPECÍFICAS
    // ----------------------------------------------------------------------
    
    // Simula a escolha de uma nova foto
    const handleChoosePhoto = () => {
        Alert.alert(
            "Alterar Foto",
            "Escolha uma opção:",
            [
                {
                    text: "Usar Foto Padrão",
                    onPress: () => {
                        setProfile(prev => ({ 
                            ...prev, 
                            fotoUrl: DEFAULT_PROFILE_PIC 
                        }));
                        Alert.alert('✅', 'Foto atualizada para padrão!');
                    }
                },
                {
                    text: "Inserir URL Personalizada",
                    onPress: () => {
                        Alert.prompt(
                            "Nova URL da Foto",
                            "Insira a URL da nova foto:",
                            [
                                { text: "Cancelar", style: "cancel" },
                                { 
                                    text: "OK", 
                                    onPress: (newUrl: string | undefined) => {
                                        if (newUrl) {
                                            setProfile(prev => ({ ...prev, fotoUrl: newUrl }));
                                            Alert.alert('✅', 'Foto atualizada com sucesso!');
                                        }
                                    }
                                }
                            ],
                            'plain-text',
                            profile.fotoUrl || DEFAULT_PROFILE_PIC
                        );
                    }
                },
                { text: "Cancelar", style: "cancel" }
            ]
        );
    };

    // Mudar fundo do perfil
    const handleChangeHeader = () => {
        Alert.alert(
            "Alterar Fundo do Perfil",
            "Escolha uma opção:",
            [
                {
                    text: "Usar Fundo Padrão",
                    onPress: () => {
                        setProfile(prev => ({ 
                            ...prev, 
                            headerUrl: LOGIN_BACKGROUND 
                        }));
                        Alert.alert('✅', 'Fundo atualizado para padrão!');
                    }
                },
                {
                    text: "Inserir URL Personalizada",
                    onPress: () => {
                        Alert.prompt(
                            "Nova URL do Fundo",
                            "Insira a URL da nova imagem de fundo:",
                            [
                                { text: "Cancelar", style: "cancel" },
                                { 
                                    text: "OK", 
                                    onPress: (newUrl: string | undefined) => {
                                        if (newUrl) {
                                            setProfile(prev => ({ ...prev, headerUrl: newUrl }));
                                            Alert.alert('✅', 'Fundo atualizado com sucesso!');
                                        }
                                    }
                                }
                            ],
                            'plain-text',
                            profile.headerUrl || LOGIN_BACKGROUND
                        );
                    }
                },
                { text: "Cancelar", style: "cancel" }
            ]
        );
    };

    // Adiciona um novo álbum favorito
    const handleAddAlbum = () => {
        if (profile.albunsFavoritos && profile.albunsFavoritos.length >= MAX_ALBUMS) {
            Alert.alert("Limite Atingido", `Você pode adicionar no máximo ${MAX_ALBUMS} álbuns favoritos.`);
            return;
        }

        Alert.prompt(
            "Adicionar Álbum Favorito",
            "Digite o nome do álbum:",
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Adicionar", 
                    onPress: (albumTitle: string | undefined) => {
                        if (albumTitle) {
                            const newAlbum: Album = {
                                id: Date.now().toString(),
                                coverUrl: `https://placehold.co/80x80/333333/ffffff?text=${encodeURIComponent(albumTitle.substring(0, 8))}`,
                                title: albumTitle,
                            };
                            setProfile(prev => ({ 
                                ...prev, 
                                albunsFavoritos: [...(prev.albunsFavoritos || []), newAlbum] 
                            }));
                            Alert.alert( `Álbum "${albumTitle}" adicionado!`);
                        }
                    }
                }
            ],
            'plain-text'
        );
    };
    
    // Remove um álbum favorito
    const handleRemoveAlbum = (indexToRemove: number) => {
        const albumToRemove = profile.albunsFavoritos?.[indexToRemove];
        setProfile(prev => ({
            ...prev,
            albunsFavoritos: (prev.albunsFavoritos || []).filter((_, index) => index !== indexToRemove)
        }));
        if (albumToRemove) {
            Alert.alert( `Álbum "${albumToRemove.title}" removido!`);
        }
    };

    // ----------------------------------------------------------------------
    // 3. SALVAR PERFIL (SIMULA O FIREBASE)
    // ----------------------------------------------------------------------
    const handleSaveProfile = async () => {
        if (isSaving) return;

        // Validação básica
        if (!profile.nomeCompleto || !profile.username) {
            Alert.alert("Erro", "Nome completo e nome de usuário são obrigatórios.");
            return;
        }

        setIsSaving(true);
        
        // Simula o salvamento no Firebase com um delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setIsSaving(false);
        Alert.alert(
            'Perfil Atualizado!', 
            'Todas as suas alterações foram salvas com sucesso!',
            [{ text: 'OK' }]
        );
    };

    const currentPhotoUrl = profile.fotoUrl || DEFAULT_PROFILE_PIC;
    const currentHeaderUrl = profile.headerUrl || LOGIN_BACKGROUND;
    const canAddAlbum = (profile.albunsFavoritos?.length || 0) < MAX_ALBUMS;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            {/* Cabeçalho com Imagem de Fundo - AGORA EDITÁVEL */}
            <TouchableOpacity onPress={handleChangeHeader}>
                <ImageBackground
                    source={{ uri: currentHeaderUrl }}
                    style={styles.topContainer}
                    resizeMode="cover"
                    imageStyle={styles.backgroundImageStyle}>
                    {/* Ícone de edição no canto do header */}
                    <View style={styles.headerEditIcon}>
                        <Feather name="edit-2" size={16} color="#FFF" />
                    </View>
                </ImageBackground>
            </TouchableOpacity>

            {/* Ícone de Perfil e Botão de Mudar Foto */}
            <TouchableOpacity style={styles.profileIconContainer} onPress={handleChoosePhoto}>
                <Image 
                    source={{ uri: currentPhotoUrl }}
                    style={styles.profileImage}
                />
                {/* Ícone de Câmera/Edição */}
                <View style={styles.cameraIcon}>
                    <Feather name="camera" size={16} color="#FFF" />
                </View>
            </TouchableOpacity>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>@{profile.username || 'usuário'}</Text>
                <Text style={styles.subtitle}>{profile.nomeCompleto || 'Nome Completo'}</Text>

                {/* --- SEÇÃO DE ÁLBUNS FAVORITOS --- */}
<View style={styles.albumsSection}>
    <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Álbuns Favoritos</Text>
    </View>
    
    <View style={styles.albumListContainer}>
        {/* Lista de Álbuns */}
        {profile.albunsFavoritos?.map((album, index) => (
            <AlbumItem 
                key={album.id} 
                album={album} 
                index={index}
                onRemove={handleRemoveAlbum}
            />
        ))}

        {/* Botão de Adicionar - Mostra apenas se o limite não foi atingido */}
        {canAddAlbum && (
            <TouchableOpacity style={albumStyles.addAlbumButton} onPress={handleAddAlbum}>
                <Text style={albumStyles.addAlbumButtonText}>Adicionar</Text>
            </TouchableOpacity>
        )}
    </View>
</View>

                {/* --- SEÇÃO DE DADOS BÁSICOS (INPUTS) --- */}
                <View style={styles.inputsSection}>
                    <Text style={styles.sectionTitle}>Informações Pessoais</Text>

                    {/* Nome Completo */}
                    <View style={styles.inputContainer}>
                        <Feather name="user" size={20} color="#888" style={styles.inputIcon} />
                        <TextInput
                            placeholder="Nome Completo"
                            style={styles.input}
                            placeholderTextColor="#888"
                            value={profile.nomeCompleto}
                            onChangeText={(text) => setProfile(prev => ({ ...prev, nomeCompleto: text }))}
                        />
                    </View>

                    {/* Nome de Usuário */}
                    <View style={styles.inputContainer}>
                        <Feather name="at-sign" size={20} color="#888" style={styles.inputIcon} />
                        <TextInput
                            placeholder="Nome de Usuário"
                            style={styles.input}
                            placeholderTextColor="#888"
                            value={profile.username}
                            onChangeText={(text) => setProfile(prev => ({ ...prev, username: text }))}
                        />
                    </View>

                    {/* Bio / Descrição */}
                    <View style={styles.inputContainerLong}>
                        <Feather name="edit-2" size={20} color="#888" style={styles.inputIcon} />
                        <TextInput
                            placeholder="Bio (Opcional, Max 150 caracteres)"
                            style={[styles.input, styles.textArea]}
                            placeholderTextColor="#888"
                            value={profile.bio}
                            onChangeText={(text) => setProfile(prev => ({ ...prev, bio: text }))}
                            multiline
                            numberOfLines={4}
                            maxLength={150}
                        />
                    </View>
                </View>

                {/* Botão de Salvar/Atualizar */}
                <TouchableOpacity 
                    style={[
                        styles.saveButton, 
                        isSaving && styles.saveButtonDisabled
                    ]} 
                    onPress={handleSaveProfile} 
                    disabled={isSaving}
                >
                    <Text style={styles.saveButtonText}>
                        {isSaving ? 'Salvando...' : 'Salvar Perfil'}
                    </Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#D9D9D9',
    },
    // --- Cabeçalho e Foto ---
    topContainer: {
        height: 150, 
        width: '100%',
        backgroundColor: '#300505',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backgroundImageStyle: {
        width: '100%',
        height: '100%',
        opacity: 0.5,
    },
    headerEditIcon: {
        position: 'absolute',
        top: 15,
        right: 15,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileIconContainer: {
        width: 130,
        height: 130,
        borderRadius: 65,
        position: 'absolute',
        alignSelf: 'center',
        top: 85, 
        zIndex: 1,
        borderWidth: 4,
        borderColor: '#D9D9D9', 
        backgroundColor: '#FFF'
    },
    profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: 65,
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: '#8b0000',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    // --- Conteúdo Principal ---
    scrollView: {
        flex: 1,
        width: '100%',
    },
    scrollContent: {
        paddingHorizontal: 30,
        paddingTop: 70,
        paddingBottom: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#300505',
        textAlign: 'center',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 25,
    },
    // --- Seções ---
    albumsSection: {
        marginBottom: 30,
    },
    inputsSection: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#300505',
    },
    addButton: {
        backgroundColor: '#8b0000',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8,
    },
    addButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    // --- Lista de Álbuns ---
    albumListContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        gap: 15,
    },
    // --- Inputs ---
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
    inputContainerLong: {
        flexDirection: 'row',
        backgroundColor: '#c4c5c5',
        borderRadius: 15,
        width: '100%',
        marginBottom: 15,
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    inputIcon: {
        marginRight: 10,
        alignSelf: 'flex-start',
        paddingTop: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
        paddingTop: 10,
        paddingBottom: 10,
    },
    // --- Botão Salvar ---
    saveButton: {
        backgroundColor: '#8b0000',
        paddingVertical: 15,
        borderRadius: 15,
        width: '100%',
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonDisabled: {
        backgroundColor: '#666',
        opacity: 0.7,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

const albumStyles = StyleSheet.create({
    albumContainer: {
        width: 80,
        height: 80,
        borderRadius: 8,
        position: 'relative',
    },
    albumCover: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    removeButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#300505',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    addAlbumButton: {
        width: 80,
        height: 80,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#8b0000',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(139, 0, 0, 0.1)',
    },
    addAlbumButtonText: {
        color: '#8b0000',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    }
});
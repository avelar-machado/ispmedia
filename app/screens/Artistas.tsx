import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, Button, StyleSheet, Image, Platform } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { Link, useLocalSearchParams  } from 'expo-router';
import * as FileSystem from 'expo-file-system';

interface Artist {
  id: number;
  nome: string;
  imageId: number | null;
  userId: number | null;
}

interface Imagem {
  id: number;
  user_Id: number;
  url: string;
  descricao: string | null;
  nome_ficheiro: string;
  extensao: string;
}

export default function Artist() {
  const [artistas, setArtistas] = useState<Artist[]>([]);
  const [images, setImages] = useState<Imagem[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newArtist, setNewArtist] = useState<Omit<Artist, 'id' | 'imageId' | 'userId'>>({ nome: '' });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { username, code } = useLocalSearchParams(); 

  useEffect(() => {
    fetchArtistas();
    fetchImagens();
  }, [newArtist]);

  const fetchArtistas = async () => {
    try {
      const response = await axios.get<Artist[]>('https://192.168.1.183:3000/artistas');
      const allArtistas = response.data;

      // Convert idArtist to number
      const userIdNumber = typeof code === 'string' ? parseInt(code, 10) : code;
      
      // Filter albums based on artistId
      const filteredArtistas = allArtistas.filter(artista => artista.userId === userIdNumber);
      setArtistas(filteredArtistas);
    } catch (error) {
      console.error('Error fetching artists:', error);
    }
  };

  const fetchImagens = async () => {
    try {
      const response = await axios.get<Imagem[]>('https://192.168.1.183:3000/images');
      setImages(response.data);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  const addArtist = async () => {
    try {
      if (selectedImage) {
        let uri: string = selectedImage;
        let filename: string | undefined;
        let type: string | undefined;
        let blob: Blob | undefined;

        if (uri.startsWith("data:image")) {
          // Handle base64 image data
          const base64 = uri.split(",")[1];
          const mimeMatch = uri.match(/:(.*?);/);
          if (mimeMatch && base64) {
            const mime = mimeMatch[1];
            const extension = mime.split("/")[1];
            filename = newArtist.nome + '.',+extension;
            type = mime;
  
            // Convert base64 to byte array
            const byteCharacters = atob(base64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
  
            // Convert byte array to blob
            blob = new Blob([byteArray], { type: mime });
          }
        } else {
          const fileUri = selectedImage;
          const fileInfo = await FileSystem.getInfoAsync(fileUri);
          if (fileInfo.exists) {
            const formData = new FormData();
            formData.append('image', {
              uri: fileUri,
              name: newArtist.nome + '.jpeg',
              type: 'image/jpeg',
            } as any);

            const uploadResponse = await axios.post(`https://192.168.1.183:3000/upload/image/${username}`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });

            if (uploadResponse.status === 200) {
              const data = uploadResponse.data;
              const imagem_ = {
                user_Id: code,
                url: data.path,
                descricao: '',
                nome_ficheiro: data.filename,
                extensao: data.mimetype,
              };
  
              const insertResponse = await axios.post('https://192.168.1.183:3000/images', imagem_, {
                headers: {
                  'Content-Type': 'application/json',
                },
              });
  
              if (insertResponse.data) {
                try {
                  const data = insertResponse.data;
                  const artista_ = {
                    nome: newArtist.nome,
                    imageId: data.id,
                    userId: code,
                  };
          
                  await axios.post('https://192.168.1.183:3000/artistas', artista_, {
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  });
                  alert('Artista adicionado com Sucesso!');
                  console.log('Artista adicionado com Sucesso!');
                  setNewArtist({ nome: '' });
                  setSelectedImage(null);
                  setIsModalVisible(false);
                  fetchArtistas();
                } catch (error) {
                  console.error('Erro ao adicionar artista:', error);
                }
              } else {
                alert(`Erro ao inserir imagem na base de dados: ${insertResponse.data.error}`);
              }
  
              console.log('Upload successful');
            } else {
              console.error('Upload failed');
            }

          }
        }
  
        if (filename && blob && type) {
          const formData = new FormData();
          formData.append('image', blob, filename);
  
          const uploadResponse = await axios.post(`https://192.168.1.183:3000/upload/image/${username}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
  
          if (uploadResponse.status === 200) {
            const data = uploadResponse.data;
            const imagem_ = {
              user_Id: code,
              url: data.path,
              descricao: '',
              nome_ficheiro: data.filename,
              extensao: data.mimetype,
            };

            const insertResponse = await axios.post('https://192.168.1.183:3000/images', imagem_, {
              headers: {
                'Content-Type': 'application/json',
              },
            });

            if (insertResponse.data) {
              try {
                const data = insertResponse.data;
                const artista_ = {
                  nome: newArtist.nome,
                  imageId: data.id,
                  userId: code,
                };
        
                await axios.post('https://192.168.1.183:3000/artistas', artista_, {
                  headers: {
                    'Content-Type': 'application/json',
                  },
                });
                alert('Artista adicionado com Sucesso!');
                console.log('Artista adicionado com Sucesso!');
                setNewArtist({ nome: '' });
                setSelectedImage(null);
                setIsModalVisible(false);
                fetchArtistas();
              } catch (error) {
                console.error('Erro ao adicionar artista:', error);
              }
            } else {
              alert(`Erro ao inserir imagem na base de dados: ${insertResponse.data.error}`);
            }

            console.log('Upload successful');
          } else {
            console.error('Upload failed');
          }
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        const pickedImage = result.assets[0];
        setSelectedImage(pickedImage.uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={artistas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Link href={{ pathname: '/album', params: { username, code, idArtist : item.id, nameArtist : item.nome } }}>
            <View style={styles.artistContainer}>
              <Image
                source={{
                  uri: images.find(img => img.id === item.imageId) 
                    ? `https://192.168.1.183:3000/upload/image/${username}/${images.find(img => img.id === item.imageId)?.nome_ficheiro}`
                    : `https://192.168.1.183:3000/upload/image/avelarmanuel/1719273293937-img1.jpg`
                }}
                style={styles.image}
              />
              <View>
                <Text style={styles.name}>{item.nome}</Text>
              </View>
            </View>
          </Link>
        )}
      />
      <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar Novo Artista</Text>            
            <TouchableOpacity onPress={pickImage} style={styles.selectImageButton}>
              <Text style={styles.selectImageText}>Selecionar Imagem</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Nome"
              value={newArtist.nome}
              onChangeText={(text) => setNewArtist({ ...newArtist, nome: text })}
            />
            {selectedImage && <Image source={{ uri: selectedImage }} style={styles.selectedImage} />}
            <View style={styles.buttonContainer}>
              <Button title="Adicionar" onPress={addArtist} color={"#219ebc"} />
              <Button title="Cancelar" onPress={() => setIsModalVisible(false)} color={"#219ebc"} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  artistContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#f0f0f0',
    width: Platform.OS === 'web' ? '100%' : 385,
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#219ebc',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  selectImageButton: {
    backgroundColor: '#219ebc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 15,
  },
  selectImageText: {
    color: 'white',
textAlign: 'center',
},
selectedImage: {
width: 150,
height: 150,
borderRadius: 10,
marginBottom: 15,
},
buttonContainer: {
flexDirection: 'row',
justifyContent: 'space-between',
width: '100%',
},
});

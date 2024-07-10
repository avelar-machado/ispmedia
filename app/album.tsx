import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, Button, StyleSheet, Image } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { Link, useLocalSearchParams  } from 'expo-router';
import * as FileSystem from 'expo-file-system';

interface Album {
  id: number;
  nome: string;
  artistaId: number | null;
  imageId: number | null;
  imageFile: File | null;
}

interface Artist {
  id: number;
  nome: string;
  imageId: number | null;
  imageFile: File | null;
}

interface Imagem {
  id: number;
  user_Id: number;
  url: string;
  descricao: string | null;
  nome_ficheiro: string;
  extensao: string;
}

export default function Album() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [images, setImages] = useState<Imagem[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newAlbum, setNewAlbum] = useState<Omit<Album, 'id' | 'imageFile'>>({ nome: '', artistaId: null, imageId: null });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { username, code, idArtist, nameArtist } = useLocalSearchParams(); 

  useEffect(() => {
    fetchAlbums();
    fetchImagens();
  }, [newAlbum]);

  const fetchAlbums = async () => {
    try {
      const response = await axios.get<Album[]>('https://192.168.1.183:3000/admin/albuns');
      const allAlbums = response.data;

      // Convert idArtist to number
      const artistIdNumber = typeof idArtist === 'string' ? parseInt(idArtist, 10) : idArtist;
      
      // Filter albums based on artistId
      const filteredAlbums = allAlbums.filter(album => album.artistaId === artistIdNumber);
      setAlbums(filteredAlbums);
    } catch (error) {
      console.error('Error fetching albums:', error);
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

  const addAlbum = async () => {
    
    try {
      if (selectedImage) {
        let uri: string = selectedImage;
        let filename: string | undefined;
        let type: string | undefined;
        let blob: Blob | undefined;

        if (uri.startsWith("data:image")) {
          const base64 = uri.split(",")[1];
          const mimeMatch = uri.match(/:(.*?);/);
          if (mimeMatch && base64) {
            const mime = mimeMatch[1];
            const extension = mime.split("/")[1];
            filename = newAlbum.nome + '.',+extension;
            type = mime;

            const byteCharacters = atob(base64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);

            blob = new Blob([byteArray], { type: mime });
          }
        } else {
          const fileUri = selectedImage;
          const fileInfo = await FileSystem.getInfoAsync(fileUri);
          if (fileInfo.exists) {
            const formData = new FormData();
            formData.append('image', {
              uri: fileUri,
              name: newAlbum.nome + '.jpeg',
              type: 'image/jpeg',
            } as any);

            const insertImageResponse = await axios.post(`https://192.168.1.183:3000/api/upload/image/${username}`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });

            if (insertImageResponse.data) {
              const imageData = insertImageResponse.data;
              const album_ = {
                nome: newAlbum.nome,
                artistaId: idArtist,
                imageId: imageData.id,
              };

              const insertAlbumResponse = await axios.post('https://192.168.1.183:3000/albuns', album_, {
                headers: {
                  'Content-Type': 'application/json',
                },
              });

              if (insertAlbumResponse.data) {
                alert('Álbum adicionado com sucesso!');
                setNewAlbum({ nome: '', artistaId: null, imageId: null });
                setSelectedImage(null);
                setIsModalVisible(false);
                fetchAlbums();
              } else {
                alert('Erro ao adicionar álbum.');
              }
            } else {
              alert(`Erro ao inserir imagem na base de dados: ${insertImageResponse.data.error}`);
            }
          } else {
            console.error('Upload failed');
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
            const image_ = {
              user_Id: code,
              url: data.path,
              descricao: newAlbum.nome,
              nome_ficheiro: data.filename,
              extensao: data.mimetype,
            };

            const insertImageResponse = await axios.post('https://192.168.1.183:3000/images', image_, {
              headers: {
                'Content-Type': 'application/json',
              },
            });

            if (insertImageResponse.data) {
              const imageData = insertImageResponse.data;
              const album_ = {
                nome: newAlbum.nome,
                artistaId: idArtist,
                imageId: imageData.id,
              };

              const insertAlbumResponse = await axios.post('https://192.168.1.183:3000/albuns', album_, {
                headers: {
                  'Content-Type': 'application/json',
                },
              });

              if (insertAlbumResponse.data) {
                alert('Álbum adicionado com sucesso!');
                setNewAlbum({ nome: '', artistaId: null, imageId: null });
                setSelectedImage(null);
                setIsModalVisible(false);
                fetchAlbums();
              } else {
                alert('Erro ao adicionar álbum.');
              }
            } else {
              alert(`Erro ao inserir imagem na base de dados: ${insertImageResponse.data.error}`);
            }
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
      <Text style = {styles.head} >ALBUNS </Text>
      <FlatList
        data={albums}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.albumContainer}>
            <Link href={{ pathname: '/mediaLibrary', params: { username, code, idAlbum : item.id, idArtist : item.artistaId } }}> 
              <Image
                source={{
                  uri: images.find(img => img.id === item.imageId)
                    ? `https://192.168.1.183:3000/upload/image/${username}/${images.find(img => img.id === item.imageId)?.nome_ficheiro}`
                    : `https://192.168.1.183:3000/upload/image/avelarmanuel/1719310871715-ispmedia.jpeg`
                }}
                style={styles.image}
              />
              <View>
                <Text style={styles.name}>{item.nome}</Text>
              </View>
            </Link> 
          </View>
        )}
      />
      <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar Novo Álbum</Text>
            <TouchableOpacity onPress={pickImage} style={styles.selectImageButton}>
              <Text style={styles.selectImageText}>Selecionar Imagem</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Nome"
              value={newAlbum.nome}
              onChangeText={(text) => setNewAlbum({ ...newAlbum, nome: text })}
            />            
            {selectedImage && <Image source={{ uri: selectedImage }} style={styles.selectedImage} />}
            <View style={styles.buttonContainer}>
              <Button title="Adicionar" onPress={addAlbum} color="#219ebc" />
              <Button title="Cancelar" onPress={() => setIsModalVisible(false)} color="#219ebc" />
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
    marginTop: 30,
    backgroundColor: '#fff',
  },
  head: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
  },
  albumContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#f0f0f0',
    padding: 10,
    width: '100%',
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
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    width: '100%',
  },
  selectImageButton: {
    backgroundColor: '#219ebc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  selectImageText: {
    color: 'white',
    fontSize: 16,
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
});

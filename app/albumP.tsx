import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, Button, StyleSheet, Image } from 'react-native';
import { Link } from 'expo-router';

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
  const [images, setImages] = useState<Imagem[]>([]);
 

  useEffect(() => {
    fetchAlbums();
    fetchImagens();
  }, []);

  const fetchAlbums = async () => {
    try {
      const response = await axios.get<Album[]>('http://192.168.1.109:3000/admin/albuns');
      setAlbums(response.data);
    } catch (error) {
      console.error('Error fetching albums:', error);
    }
  };

  const fetchImagens = async () => {
    try {
      const response = await axios.get<Imagem[]>('http://192.168.1.109:3000/images');
      setImages(response.data);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };


  return (
    <View style={styles.container}>
      <Text style = {styles.head} >ALBUNS</Text>
      <FlatList
        data={albums}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.albumContainer}>
            <Link href={{ pathname: '/mediaLibraryP' }}> 
              <Image
                source={{
                  uri: images.find(img => img.id === item.imageId)
                    ? `http://192.168.1.109:3000/upload/image/avelarmanuel/${images.find(img => img.id === item.imageId)?.nome_ficheiro}`
                    : `http://192.168.1.109:3000/upload/image/avelarmanuel/1719310871715-ispmedia.jpeg`
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
});

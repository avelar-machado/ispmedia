import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';

interface Album {
  id: number;
  nome: string;
  artistaId: number | null;
  imageId: number;
  public: boolean;
}

interface Artista {
  id: number;
  nome: string;
  imageId: number;
}

interface Imagem {
  id: number;
  url: string;
  nome_ficheiro: string;
  user_Id: number;
}

interface User {
    id: number;
    username: string;
    nome: string;
  }

interface AlbumWithArtista extends Album {
  artista: Artista;
}

const SearchComponent: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Artista[]>([]);
  const [images, setImages] = useState<Imagem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredAlbums, setFilteredAlbums] = useState<Album[]>([]);
  const [filteredArtists, setFilteredArtists] = useState<Artista[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Album | Artista | AlbumWithArtista | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [albumsResponse, artistsResponse, imagesResponse, usersResponse] = await Promise.all([
          axios.get<Album[]>('https://192.168.1.109:3000/admin/albuns'),
          axios.get<Artista[]>('https://192.168.1.109:3000/artistas'),
          axios.get<Imagem[]>('https://192.168.1.109:3000/images'),
          axios.get<User[]>('https://192.168.1.109:3000/users')
        ]);
        setAlbums(albumsResponse.data);
        setArtists(artistsResponse.data);
        setImages(imagesResponse.data);
        setUsers(usersResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const search = (query: string) => {
    const lowercasedQuery = query.toLowerCase();
    setFilteredAlbums(
      albums.filter(album => album.nome.toLowerCase().includes(lowercasedQuery))
    );
    setFilteredArtists(
      artists.filter(artist => artist.nome.toLowerCase().includes(lowercasedQuery))
    );
  };

  const handleSelectItem = async (item: Album | Artista) => {
    if ('artistaId' in item && item.artistaId) {
      const artist = artists.find(artist => artist.id === item.artistaId);
      if (artist) {
        setSelectedItem({ ...item, artista: artist } as AlbumWithArtista);
      } else {
        setSelectedItem(item);
      }
    } else {
      setSelectedItem(item);
    }
  };

  const getImageUrl = (imageId: number | null) => {
    const image = images.find(img => img.id === imageId);
    const nameUser = users.find(user => user.id === image?.user_Id);
    return image ? `https://192.168.1.109:3000/upload/image/${nameUser?.username}/${image.nome_ficheiro}` : 'https://192.168.1.109:3000/upload/image/avelarmanuel/default.jpg';
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Pesquisar por artista, gênero ou título do álbum"
        value={searchQuery}
        onChangeText={query => {
          setSearchQuery(query);
          search(query);
        }}
      />
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          {filteredArtists.length > 0 && (
            <>
              <Text style={styles.sectionHeader}>Artistas</Text>
              <FlatList
                data={filteredArtists}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handleSelectItem(item)}>
                    <View style={styles.resultItem}>
                      <Image source={{ uri: getImageUrl(item.imageId) }} style={styles.image} />
                      <Text style={styles.resultText}>{item.nome}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </>
          )}
          {filteredAlbums.length > 0 && (
            <>
              <Text style={styles.sectionHeader}>Álbuns</Text>
              <FlatList
                data={filteredAlbums}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handleSelectItem(item)}>
                    <View style={styles.resultItem}>
                      <Image source={{ uri: getImageUrl(item.imageId) }} style={styles.image} />
                      <Text style={styles.resultText}>{`${item.nome} por ${item.artistaId ? artists.find(artist => artist.id === item.artistaId)?.nome : 'Artista Desconhecido'}`}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </>
          )}
        </>
      )}
      {selectedItem && (
        <View style={styles.detailsContainer}>
          {'nome' in selectedItem ? (
            <>
            <Link href={{ pathname: '/albumP' }}><Text style={styles.detailsTitle}>{selectedItem.nome}PP</Text></Link>              
              {'artistaId' in selectedItem && selectedItem.artistaId && (
                <>
                  <Text>Artista: {(selectedItem as AlbumWithArtista).artista.nome}</Text>
                </>
              )}
              <Image source={{ uri: getImageUrl(selectedItem.imageId) }} style={styles.image} />
            </>
          ) : (
            <>
              <Text style={styles.detailsTitle}>{selectedItem}</Text>
              <Image source={{ uri: getImageUrl(selectedItem) }} style={styles.image} />
            </>
          )}
          <TouchableOpacity onPress={() => setSelectedItem(null)}>
            <Text style={styles.closeButton}>Fechar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default SearchComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  searchInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingLeft: 8,
    borderRadius: 5,
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  resultText: {
    marginLeft: 10,
    fontSize: 16,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  detailsContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  closeButton: {
    marginTop: 10,
    color: 'blue',
  },
});

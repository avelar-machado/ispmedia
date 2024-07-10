import React, { useState, useRef, useEffect, createRef } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Modal, TextInput, StyleSheet, Platform, Button } from 'react-native';
import { Audio, Video, ResizeMode } from 'expo-av';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Slider from '@react-native-community/slider';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { AVPlaybackStatus } from 'expo-av/build/AV';
import { useLocalSearchParams  } from 'expo-router';

interface VideoType {
  id: number;
  user_Id: number;
  albumId: number;
  url: string;
  descricao: string;
  nome_ficheiro: string;
  extensao: string;
}

interface AudioType {
  id: number;
  titulo: string;
  generoID: number;
  artistId: number;
  albumId: number;
  imageId: number;
  url: string;
  userId: number;
  nome_ficheiro: string;
  extensao: string;
}

export default function Media() {
    const audioRef = [React.useRef(new Audio.Sound()), React.useRef(new Audio.Sound()), React.useRef(new Audio.Sound())];
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [musicas, setMusicas] = useState<AudioType[]>([]);
  const [isVideoModalVisible, setIsVideoModalVisible] = useState(false);
  const [isMusicModalVisible, setIsMusicModalVisible] = useState(false);
  const [newVideo, setNewVideo] = useState<Omit<VideoType, 'id'>>({
    user_Id: 0,
    albumId: 0,
    url: '',
    descricao: '',
    nome_ficheiro: '',
    extensao: '',
  });
  const [newMusic, setNewMusic] = useState<Omit<AudioType, 'id'>>({
    titulo: '',
    generoID: 0,
    artistId: 0,
    albumId: 0,
    imageId: 0,
    url: '',
    userId: 0,
    nome_ficheiro: '',
    extensao: '',
  });
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
  const [audioRefs, setAudioRefs] = useState<React.MutableRefObject<Video | null>[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean[]>([]);
  const [position, setPosition] = useState<number[]>([]);
  const [duration, setDuration] = useState<number[]>([]);
  const { username, code, idArtist, idAlbum } = useLocalSearchParams(); 

  useEffect(() => {
    fetchVideos();
    fetchMusicas();
  }, [newVideo]);

  useEffect(() => {
    return () => {
      audioRefs.forEach(async ref => {
        await ref.current?.unloadAsync();
      });
    };
  }, [audioRefs]);

  const fetchVideos = async () => {
    try {
      const response = await axios.get<VideoType[]>('https://192.168.1.183:3000/videos');
      setVideos(response.data);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  const fetchMusicas = async () => {
    try {
      const response = await axios.get<AudioType[]>('https://192.168.1.183:3000/musics');
      setMusicas(response.data);
      setAudioRefs(response.data.map(() => createRef<Video | null>()));
      setIsPlaying(new Array(response.data.length).fill(false));
      setPosition(new Array(response.data.length).fill(0));
      setDuration(new Array(response.data.length).fill(0));
    } catch (error) {
      console.error('Error fetching musicas:', error);
    }
  };

  const addVideo = async () => {
    try {
      if (selectedVideo) {

        if (Platform.OS !== 'web') {
            const fileUri = selectedVideo;
            const fileInfo = await FileSystem.getInfoAsync(fileUri);
            if (fileInfo.exists) {
                const formData = new FormData();
                formData.append('video', {
                    uri: fileUri,
                    name: 'video.mp4',
                    type: 'video/mp4',
                } as any);

                const uploadResponse = await axios.post(`https://192.168.1.183:3000/upload/video/${username}`, formData, {
                    headers: {
                    'Content-Type': 'multipart/form-data',
                    },
                });

                if (uploadResponse.data) {
                    const data = uploadResponse.data;

                    const video_ = {
                    user_Id: code,
                    albumId: idAlbum,
                    url: data.path,
                    descricao: newVideo.descricao,
                    nome_ficheiro: data.filename,
                    extensao: data.mimetype,
                    };

                    await axios.post('https://192.168.1.183:3000/videos', video_, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    });

                    alert('Vídeo adicionado com sucesso!');
                    setNewVideo({ user_Id: 0, albumId: 0, url: '', descricao: '', nome_ficheiro: '', extensao: '' });
                    setSelectedVideo(null);
                    setIsVideoModalVisible(false);
                    fetchVideos();
                } else {
                    console.error('Upload failed');
                }
            } else {
                alert ("Aqui");
                console.error('File does not exist');
            }
        } else {
            const response = await fetch(selectedVideo);
            const blob = await response.blob();
            const formData = new FormData();
            formData.append('video', blob, newVideo.descricao+'.mp4');
            alert("Aqui 2 : " + username);
    
            const uploadResponse = await axios.post(`https://192.168.1.183:3000/upload/video/${username}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
           
            
            if (uploadResponse.data) {
                const data = uploadResponse.data;
    
                const video_ = {
                  user_Id: code,
                  albumId: idAlbum,
                  url: data.path,
                  descricao: newVideo.descricao,
                  nome_ficheiro: data.filename,
                  extensao: data.mimetype,
                };
    
                await axios.post('https://192.168.1.183:3000/videos', video_, {
                  headers: {
                    'Content-Type': 'application/json',
                  },
                });
    
                alert('Vídeo adicionado com sucesso!');
                setNewVideo({ user_Id: 0, albumId: 0, url: '', descricao: '', nome_ficheiro: '', extensao: '' });
                setSelectedVideo(null);
                setIsVideoModalVisible(false);
                fetchVideos();
            } else {
                console.error('Upload failed');
            }
        }

      }
        
    } catch (error) {
      console.error('Error uploading video:', error);
    }
  };

  const addMusic = async () => {
    try {
      if (selectedMusic) {

        if (Platform.OS !== 'web') {
            const fileUri = selectedMusic;
            const fileInfo = await FileSystem.getInfoAsync(fileUri);
            if (fileInfo.exists) {
            const formData = new FormData();
            formData.append('music', {
                uri: fileUri,
                name: 'music.mp3',
                type: 'music/mp3',
            } as any);
            
            const uploadResponse = await axios.post(`https://192.168.1.183:3000/upload/music/${username}`, formData, {
                headers: {
                'Content-Type': 'multipart/form-data',
                },
            });
            
            if (uploadResponse.data) {
                const data = uploadResponse.data;
                if (data && data.path && data.filename && data.mimetype) {
                const music_ = {
                    titulo: newMusic.titulo,
                    generoId: 1,
                    artistaId: idArtist,
                    albumId: idAlbum,
                    url: data.path,
                    userId: code,
                    nome_ficheiro: data.filename,
                    extensao: data.mimetype,
                    "estado": true,
                };

                const musicInsertResponse = await axios.post('https://192.168.1.183:3000/musics', music_, {
                    headers: {
                    'Content-Type': 'application/json',
                    },
                });

                if (musicInsertResponse.data) {
                    alert('Música adicionada com sucesso!');
                    setNewMusic({
                        titulo: '',
                        generoID: 0,
                        artistId: 0,
                        albumId: 0,
                        imageId: 0,
                        url: '',
                        userId: 0,
                        nome_ficheiro: '',
                        extensao: '',
                    });
                    setSelectedMusic(null);
                    setIsMusicModalVisible(false);
                    fetchMusicas();
                } else {
                    console.error('Failed to add music to database:', musicInsertResponse);
                    alert('Ocorreu um erro ao adicionar a música ao banco de dados. Verifique a conexão ou tente novamente mais tarde.');
                }
                } else {
                console.error('Invalid upload response data:', data);
                alert('Ocorreu um erro no upload da música. Verifique a conexão ou tente novamente mais tarde.');
                }
            } else {
                console.error('Upload failed with status:', uploadResponse.status);
                alert('Ocorreu um erro ao fazer o upload da música. Verifique a conexão ou tente novamente mais tarde.');
            }
            } else {
            console.error('File does not exist');
            alert('O arquivo de música selecionado não existe. Por favor, tente selecionar outro arquivo.');
            }
        } else {
            const response = await fetch(selectedMusic);
            const blob = await response.blob();
            const formData = new FormData();
            formData.append('music', blob, newMusic.titulo+'.mp4');
    
            const uploadResponse = await axios.post(`https://192.168.1.183:3000/upload/music/${username}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            if (uploadResponse.data) {
                const data = uploadResponse.data;
                if (data && data.path && data.filename && data.mimetype) {
                const music_ = {
                    titulo: newMusic.titulo,
                    generoId: 1,
                    artistaId: idArtist,
                    albumId: idAlbum,
                    url: data.path,
                    userId: code,
                    nome_ficheiro: data.filename,
                    extensao: data.mimetype,
                    "estado": true,
                };

                const musicInsertResponse = await axios.post('https://192.168.1.183:3000/musics', music_, {
                    headers: {
                    'Content-Type': 'application/json',
                    },
                });

                if (musicInsertResponse.data) {
                    alert('Música adicionada com sucesso!');
                    setNewMusic({
                        titulo: '',
                        generoID: 0,
                        artistId: 0,
                        albumId: 0,
                        imageId: 0,
                        url: '',
                        userId: 0,
                        nome_ficheiro: '',
                        extensao: '',
                    });
                    setSelectedMusic(null);
                    setIsMusicModalVisible(false);
                    fetchMusicas();
                } else {
                    console.error('Failed to add music to database:', musicInsertResponse);
                    alert('Ocorreu um erro ao adicionar a música ao banco de dados. Verifique a conexão ou tente novamente mais tarde.');
                }
                } else {
                console.error('Invalid upload response data:', data);
                alert('Ocorreu um erro no upload da música. Verifique a conexão ou tente novamente mais tarde.');
                }
            } else {
                console.error('Upload failed with status:', uploadResponse.status);
                alert('Ocorreu um erro ao fazer o upload da música. Verifique a conexão ou tente novamente mais tarde.');
            }
        }
      }
    } catch (error) {
      console.error('Error uploading music:', error);
      alert('Ocorreu um erro ao adicionar a música. Verifique a conexão ou tente novamente mais tarde.');
    }
  };

  const pickVideo = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        const pickedVideo = result.assets[0];
        setSelectedVideo(pickedVideo.uri);
      }
    } catch (error) {
      console.error('Error picking video:', error);
    }
  };

  const pickMusic = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
      });

      if (!result.canceled) {
        const pickedMusic = result.assets[0];
        setSelectedMusic(pickedMusic.uri);
      }
    } catch (error) {
      console.error('Error picking music:', error);
    }
  };

  const loadAndPlaySound = async (index: number, uri: string) => {
    const soundObject = audioRef[index].current;
    try {
      await soundObject.unloadAsync(); // Unload any previous sound
      await soundObject.loadAsync({ uri });
      soundObject.setOnPlaybackStatusUpdate(status => updatePlaybackStatus(index, status));
      await soundObject.playAsync();
      setIsPlaying(prev => prev.map((play, i) => (i === index ? true : play)));
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const updatePlaybackStatus = (index: number, status: any) => {
    if (status.isLoaded) {
      setPosition(prev => prev.map((pos, i) => (i === index ? status.positionMillis : pos)));
      setDuration(prev => prev.map((dur, i) => (i === index ? status.durationMillis : dur)));
      if (status.didJustFinish) {
        setIsPlaying(prev => prev.map((play, i) => (i === index ? false : play)));
      }
    }
  };

  const seekAudio = async (index: number, positionMillis: number) => {
    const soundObject = audioRef[index].current;
    await soundObject.setPositionAsync(positionMillis);
  };

  const playPauseAudio = async (index: number, uri: string) => {
    const soundObject = audioRef[index].current;
    const status = await soundObject.getStatusAsync();
    if (status.isLoaded) {
      if (status.isPlaying) {
        await soundObject.pauseAsync();
        setIsPlaying(prev => prev.map((play, i) => (i === index ? false : play)));
      } else {
        await soundObject.playAsync();
        setIsPlaying(prev => prev.map((play, i) => (i === index ? true : play)));
      }
    } else {
      loadAndPlaySound(index, uri);
    }
  };
  
  const converterMilisegundosEmMinutos = (ms: number) => {
    const minutos = Math.floor(ms / 60000);
    const segundos = ((ms % 60000) / 1000).toFixed(0);
    return `${minutos}:${segundos}`;
  };

  const seekVideo = async (index: number, positionMillis: number) => {
    const videoRef = audioRefs[index].current;
    if (videoRef) {
      await videoRef.setPositionAsync(positionMillis);
    }
  };
  
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.head}>Vídeos e Músicas</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => setIsVideoModalVisible(true)}>
            <Text style={styles.buttonText}>Adicionar Vídeo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => setIsMusicModalVisible(true)}>
            <Text style={styles.buttonText}>Adicionar Música</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Vídeos</Text>
        {videos.map((video, index) => (
          <View key={index} style={styles.videoContainer}>
            <Video
              ref={audioRefs[index]}
              style={styles.video}
              source={{ uri: `https://192.168.1.183:3000/upload/video/${username}/${video.nome_ficheiro}` }}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              isLooping
              onPlaybackStatusUpdate={(status: AVPlaybackStatus) => {
                if (status.isLoaded) {
                  const newPosition = [...position];
                  newPosition[index] = status.positionMillis || 0;
                  setPosition(newPosition);

                  const newDuration = [...duration];
                  newDuration[index] = status.durationMillis || 0;
                  setDuration(newDuration);
                } else {
                  if (status.error) {
                    console.error(`Error: ${status.error}`);
                  }
                }
              }}
            />
            <Text style={styles.description}>{video.descricao}</Text>
            <View style={styles.controls}>
              <TouchableOpacity onPress={() => seekVideo(index, position[index] - 10000)} style={{ marginRight: 10 }}>
                <FontAwesome name="backward" size={24} color="black" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => seekVideo(index, position[index] + 15000)} style={{ marginRight: 10 }}>
                <FontAwesome name="forward" size={24} color="black" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <Text style={styles.title}>Músicas</Text>
        {musicas.map((music, index) => (
          <View key={index} style={styles.musicContainer}>
            <Text style={styles.musicTitle}>{music.titulo}</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration[index]}
              value={position[index]}
              onSlidingComplete={value => seekAudio(index, value)}
            />
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{converterMilisegundosEmMinutos(position[index])}</Text>
              <Text style={styles.timeText}>{converterMilisegundosEmMinutos(duration[index])}</Text>
            </View>
            <View style={styles.controls}>
              <TouchableOpacity onPress={() => seekAudio(index, position[index] - 10000)} style={{ marginRight: 10 }}>
                <FontAwesome name="backward" size={24} color="black" />
              </TouchableOpacity>
              <FontAwesome
              name={isPlaying[index] ? 'pause' : 'play'}
              size={24}
              color="black"
              onPress={() =>
                playPauseAudio(
                  index,
                  `https://192.168.1.183:3000/upload/music/${username}/${music.nome_ficheiro}`
                )
              }
              style={{ marginRight: 10 }}
              />
              <TouchableOpacity onPress={() => seekAudio(index, position[index] + 15000)} style={{ marginRight: 10 }}>
                <FontAwesome name="forward" size={24} color="black" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <Modal visible={isVideoModalVisible} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Adicionar Novo Vídeo</Text>              
              <TouchableOpacity style={styles.selectImageButton} onPress={pickVideo}>
                <Text style={styles.selectImageText}>Escolher Vídeo</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                placeholder="Descrição"
                value={newVideo.descricao}
                onChangeText={text => setNewVideo({ ...newVideo, descricao: text })}
              />
              {selectedVideo && <Text style={styles.selectedFileName}>{selectedVideo.split('/').pop()}</Text>}
              <View style={styles.buttonContainer}>
                <Button title="Adicionar" onPress={addVideo} color={"#219ebc"} />
                <Button title="Cancelar" onPress={() => setIsVideoModalVisible(false)} color={"#219ebc"} />
              </View>
            </View>
          </View>
        </Modal>

       {/* Modal para adicionar músicas */}
       <Modal visible={isMusicModalVisible} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Adicionar Nova Música</Text>
              <TouchableOpacity style={styles.selectImageButton} onPress={pickMusic}>
                <Text style={styles.selectImageText}>Escolher Música</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                placeholder="Título"
                value={newMusic.titulo}
                onChangeText={text => setNewMusic({ ...newMusic, titulo: text })}
              />
              {selectedMusic && <Text style={styles.selectedFileName}>{selectedMusic.split('/').pop()}</Text>}
              <View style={styles.buttonContainer}>
                <Button title="Adicionar" onPress={addMusic} color={"#219ebc"} />
                <Button title="Cancelar" onPress={() => setIsMusicModalVisible(false)} color={"#219ebc"} />
              </View>
            </View>
          </View>
        </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'space-around',
  },
  button: {
    marginHorizontal: 10,
    padding: 10,
    backgroundColor: '#3498db',
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  head: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  videoContainer: {
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    marginBottom: 5,
    textAlign:'center',
    fontWeight: 'bold',
  },
  video: {
    width: Platform.OS === 'web' ? 700 : '100%',
    height: Platform.OS === 'web' ? 370 : 250,
  },
  musicContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  musicTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  slider: {
    width: 300,
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 300,
    marginBottom: 10,
  },
  timeText: {
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'white',
  },
  modalButton: {
    padding: 10,
    backgroundColor: '#3498db',
    borderRadius: 5,
    marginBottom: 10,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalContent: {
    width: '50%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
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
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  selectImageText: {
    color: 'white',
    textAlign: 'center',
  },
  selectedFileName: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 15,
  },
});
import React, { useState, useRef, useEffect, createRef } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Modal, TextInput, FlatList, StyleSheet, Platform, Button } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Slider from '@react-native-community/slider';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { AVPlaybackStatus } from 'expo-av/build/AV';

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
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [musicas, setMusicas] = useState<AudioType[]>([]);
  const [isVideoModalVisible, setIsVideoModalVisible] = useState(false);
  const [isMusicModalVisible, setIsMusicModalVisible] = useState(false);
  const [newVideo, setNewVideo] = useState<Omit<VideoType, 'id'>>({
    user_Id: 1,
    albumId: 1,
    url: '',
    descricao: '',
    nome_ficheiro: '',
    extensao: '',
  });
  const [newMusic, setNewMusic] = useState<Omit<AudioType, 'id'>>({
    titulo: '',
    generoID: 1,
    artistId: 1,
    albumId: 1,
    imageId: 1,
    url: '',
    userId: 1,
    nome_ficheiro: '',
    extensao: '',
  });
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
  const [audioRefs, setAudioRefs] = useState<React.MutableRefObject<Video | null>[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean[]>([]);
  const [position, setPosition] = useState<number[]>([]);
  const [duration, setDuration] = useState<number[]>([]);

  useEffect(() => {
    fetchVideos();
    fetchMusicas();
  }, []);

  useEffect(() => {
    return () => {
      audioRefs.forEach(async ref => {
        await ref.current?.unloadAsync();
      });
    };
  }, [audioRefs]);

  const fetchVideos = async () => {
    try {
      const response = await axios.get<VideoType[]>('http://192.168.1.109:3000/videos');
      setVideos(response.data);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  const fetchMusicas = async () => {
    try {
      const response = await axios.get<AudioType[]>('http://192.168.1.109:3000/musics');
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
        const fileUri = selectedVideo;

        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (fileInfo.exists) {
          const formData = new FormData();
          formData.append('video', {
            uri: fileUri,
            name: 'video.mp4',
            type: 'video/mp4',
          } as any);

          const uploadResponse = await axios.post('http://192.168.1.109:3000/api/upload/video/avelarmanuel', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          if (uploadResponse.data) {
            const data = uploadResponse.data;

            const video_ = {
              user_Id: 1,
              albumId: 1,
              url: data.path,
              descricao: newVideo.descricao,
              nome_ficheiro: data.filename,
              extensao: data.mimetype,
            };

            await axios.post('http://192.168.1.109:3000/videos', video_, {
              headers: {
                'Content-Type': 'application/json',
              },
            });

            alert('Vídeo adicionado com sucesso!');
            setNewVideo({ user_Id: 1, albumId: 1, url: '', descricao: '', nome_ficheiro: '', extensao: '' });
            setSelectedVideo(null);
            setIsVideoModalVisible(false);
            fetchVideos();
          } else {
            console.error('Upload failed');
          }
        } else {
          console.error('File does not exist');
        }
      }
    } catch (error) {
      console.error('Error uploading video:', error);
    }
  };

  const addMusic = async () => {
    try {
      if (selectedMusic) {
        const fileUri = selectedMusic;
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (fileInfo.exists) {
          const formData = new FormData();
          formData.append('music', {
            uri: fileUri,
            name: 'music.mp3',
            type: 'music/mp3',
          } as any);
          
          const uploadResponse = await axios.post('http://192.168.1.109:3000/api/upload/music/avelarmanuel', formData, {
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
                artistaId: 1,
                albumId: 1,
                imageId: 13,
                url: data.path,
                userId: 1,
                nome_ficheiro: data.filename,
                extensao: data.mimetype,
                "estado": true,
              };

              const musicInsertResponse = await axios.post('http://192.168.1.109:3000/musics', music_, {
                headers: {
                  'Content-Type': 'application/json',
                },
              });

              alert("Aqui vamos");

              if (musicInsertResponse.data) {
                alert('Música adicionada com sucesso!');
                setNewMusic({
                    titulo: '',
                    generoID: 1,
                    artistId: 1,
                    albumId: 1,
                    imageId: 1,
                    url: '',
                    userId: 1,
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

  const seekAudio = (index: number, value: number) => {};
  const playPauseAudio = (index: number, uri: string) => {};
  const converterMilisegundosEmMinutos = (ms: number) => {
    const minutos = Math.floor(ms / 60000);
    const segundos = ((ms % 60000) / 1000).toFixed(0);
    return `${minutos}:${segundos}`;
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
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
                source={{ uri: `http://192.168.1.109:3000/api/upload/video/avelarmanuel/${video.nome_ficheiro}` }}
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
            <FontAwesome
              name={isPlaying[index] ? 'pause' : 'play'}
              size={24}
              color="black"
              onPress={() => playPauseAudio(index, `http://192.168.1.109:3000/api/upload/music/avelarmanuel/${music.nome_ficheiro}`)}
            />
          </View>
        ))}

        {/* Modal para adicionar vídeos */}
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
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    backgroundColor: '#219ebc',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  videoContainer: {
    marginBottom: 20,
  },
  video: {
    width: Platform.OS === 'web' ? 700 : '100%',
    height: Platform.OS === 'web' ? 390 : 250,
  },
  description: {
    fontSize: 16,
    marginTop: 0,
  },
  musicContainer: {
    marginBottom: 20,
  },
  musicTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
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

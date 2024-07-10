import React, { useState, useRef, useEffect, createRef } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Modal, TextInput, StyleSheet, Platform, Button } from 'react-native';
import { Audio, Video, ResizeMode } from 'expo-av';
import { FontAwesome } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import axios from 'axios';
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
  const audioRef = [React.useRef(new Audio.Sound()), React.useRef(new Audio.Sound()), React.useRef(new Audio.Sound())];
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [musicas, setMusicas] = useState<AudioType[]>([]);
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

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
      <Text style = {styles.head} >Vídeos e Músicas</Text>

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
  head: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 30,
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
    alignItems: 'center',
    marginBottom: 20,
  },
  video: {
    width: Platform.OS === 'web' ? 1300 : '100%',
    height: Platform.OS === 'web' ? 720 : 250,
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

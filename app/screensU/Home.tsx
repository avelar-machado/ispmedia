import * as React from 'react';
import { View, StyleSheet, Text, ScrollView, Platform, Image, TouchableOpacity } from 'react-native';
import { Audio, Video, ResizeMode } from 'expo-av';
import { FontAwesome } from '@expo/vector-icons';
import { Link, useLocalSearchParams } from 'expo-router';
import Slider from '@react-native-community/slider';

export default function App() {
  const audioRefs = [React.useRef(new Audio.Sound()), React.useRef(new Audio.Sound()), React.useRef(new Audio.Sound())];
  const videoRefs = [React.useRef<Video>(null), React.useRef<Video>(null), React.useRef<Video>(null)];
  const [statuses, setStatuses] = React.useState<any[]>([{}, {}, {}]);
  const [isPlaying, setIsPlaying] = React.useState<boolean[]>([false, false, false]);
  const [position, setPosition] = React.useState<number[]>([0, 0, 0]);
  const [duration, setDuration] = React.useState<number[]>([0, 0, 0]);
  const { username, data } = useLocalSearchParams();

  const videos = [
    {
      uri: 'https://192.168.1.109:3000/upload/video/avelarmanuel/1720605569379-6Lack - Love.mp4',
      caption: '6Lack - Love'
    },
    {
      uri: 'https://192.168.1.109:3000/upload/video/avelarmanuel/1720605753875-Coldplay - Family.mp4',
      caption: 'Coldplay - Family'
    },
    {
      uri: 'https://192.168.1.109:3000/upload/video/avelarmanuel/1720606164610-Bunny - funny.mp4',
      caption: 'Bunny - funny'
    }
  ];

  const musicas = [
    {
      uri: 'https://192.168.1.109:3000/upload/music/avelarmanuel/1720600390519-Gabi - Deus.mp4',
      title: 'Gabi - Deus'
    },
    {
      uri: 'https://192.168.1.109:3000/upload/music/avelarmanuel/1720606222305-PH - Sonhe.mp4',
      title: 'GosPH - Sonhepel'
    },
    {
      uri: 'https://192.168.1.109:3000/upload/music/avelarmanuel/1720606264348-Gabiela - Ame.mp4',
      title: 'Gabiela - Ame'
    }
  ];

  React.useEffect(() => {
    return () => {
      // Unload sounds when the component unmounts
      audioRefs.forEach(async ref => {
        await ref.current.unloadAsync();
      });
    };
  }, []);

  const loadAndPlaySound = async (index: number, uri: string) => {
    const soundObject = audioRefs[index].current;
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

  const playPauseAudio = async (index: number, uri: string) => {
    const soundObject = audioRefs[index].current;
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

  const seekAudio = async (index: number, positionMillis: number) => {
    const soundObject = audioRefs[index].current;
    await soundObject.setPositionAsync(positionMillis);
  };

  const seekForwardVideo = async (index: number) => {
    if (videoRefs[index].current) {
      const status = await videoRefs[index].current!.getStatusAsync();
      if (status.isLoaded) {
        const duration = status.durationMillis ?? 0;
        const newPosition = Math.min(status.positionMillis + 15000, duration);
        await videoRefs[index].current!.setPositionAsync(newPosition);
      }
    }
  };
  
  const seekBackwardVideo = async (index: number) => {
    if (videoRefs[index].current) {
      const status = await videoRefs[index].current!.getStatusAsync();
      if (status.isLoaded) {
        const newPosition = Math.max(status.positionMillis - 10000, 0);
        await videoRefs[index].current!.setPositionAsync(newPosition);
      }
    }
  };

  const converterMilisegundosEmMinutos = (millis: number) => {
    const minutos = Math.floor(millis / 60000);
    const segundos = ((millis % 60000) / 1000).toFixed(0);
    return `${minutos}:${segundos.padStart(2, '0')}`;
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Vídeos Populares</Text>
        {videos.map((video, index) => (
          <View key={index} style={styles.videoContainer}>
            <Video
              ref={videoRefs[index]}
              style={styles.video}
              source={{ uri: video.uri }}
              rate={1.0}
              volume={1.0}
              isMuted={false}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={false}
              useNativeControls
              isLooping
              onPlaybackStatusUpdate={status => {
                const newStatuses = [...statuses];
                newStatuses[index] = status;
                setStatuses(newStatuses);
              }}
            />
            <View style={styles.controls}>
              <TouchableOpacity onPress={() => seekBackwardVideo(index)} style={{ marginRight: 10 }}>
                <FontAwesome name="backward" size={24} color="black" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => seekForwardVideo(index)} style={{ marginRight: 10 }}>
                <FontAwesome name="forward" size={24} color="black" />
              </TouchableOpacity>
            </View>
            <Text style={styles.caption}>{video.caption}</Text>
          </View>
        ))}

        <Text style={styles.title}>Músicas Populares</Text>
        {musicas.map((audio, index) => (
          <View key={index} style={styles.audioContainer}>
            <Image source={require('@/assets/images/alhilal-logo.jpg')} style={styles.image} />
            <Text style={styles.description}>{audio.title}</Text>
            <View style={styles.controls}>
              <TouchableOpacity onPress={() => seekAudio(index, Math.max(position[index] - 10000, 0))} style={{ marginRight: 10 }}>
                <FontAwesome name="backward" size={24} color="black" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => playPauseAudio(index, audio.uri)} style={{ marginRight: 10 }}>
                <FontAwesome name={isPlaying[index] ? "pause" : "play"} size={24} color="black" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => seekAudio(index, Math.min(position[index] + 15000, duration[index]))}>
                <FontAwesome name="forward" size={24} color="black" />
              </TouchableOpacity>
            </View>
            <Slider
              style={styles.progressBar}
              minimumValue={0}
              maximumValue={duration[index]}
              value={position[index]}
              onSlidingComplete={(value: any) => seekAudio(index, value)}
            />
            <Text style={styles.time}>{`${converterMilisegundosEmMinutos(position[index])} / ${converterMilisegundosEmMinutos(duration[index])}`}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: Platform.OS === 'web' ? 'center' : 'stretch',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: 10,
    width: Platform.OS === 'web' ? '50%' : '100%',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  videoContainer: {
    marginBottom: 20,
  },
  video: {
    width: Platform.OS === 'web' ? 700 : '100%',
    height: Platform.OS === 'web' ? 370 : 250,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  caption: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
    marginVertical: 5,
  },
  audioContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  progressBar: {
    width: '90%',
    height: 40,
  },
  time: {
    fontSize: 14,
  },
});

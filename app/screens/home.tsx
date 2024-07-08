import * as React from 'react';
import { View, StyleSheet, Text, ScrollView, Platform, Image, TouchableOpacity } from 'react-native';
import { Audio, Video, ResizeMode } from 'expo-av';
import { FontAwesome } from '@expo/vector-icons';
import { Link } from 'expo-router';
import Slider from '@react-native-community/slider';

export default function App() {
  const audioRefs = [React.useRef(new Audio.Sound()), React.useRef(new Audio.Sound()), React.useRef(new Audio.Sound())];
  const videoRefs = [React.useRef(null), React.useRef(null), React.useRef(null)];
  const [statuses, setStatuses] = React.useState([{}, {}, {}]);
  const [isPlaying, setIsPlaying] = React.useState([false, false, false]);
  const [position, setPosition] = React.useState([0, 0, 0]);
  const [duration, setDuration] = React.useState([0, 0, 0]);

  const videos = [
    {
      uri: 'http://192.168.1.109:3000/api/upload/video/avelarmanuel/1719269017954-Coldplay.mp4',
      caption: 'Big Buck Bunny'
    },
    {
      uri: 'http://192.168.1.109:3000/api/upload/video/avelarmanuel/1719270957486-big_buck_bunny.mp4',
      caption: 'Jayz'
    },
    {
      uri: 'http://192.168.1.109:3000/api/upload/video/avelarmanuel/1719269066919-6lack.mp4',
      caption: 'Coldplay'
    }
  ];

  const musicas = [
    {
      uri: 'http://192.168.1.109:3000/api/upload/music/avelarmanuel/1719269295056-gospel.m4a',
      title: 'Jimue'
    },
    {
      uri: 'http://192.168.1.109:3000/api/upload/music/avelarmanuel/1719269271266-Jimue.mpeg',
      title: 'Gospel'
    },
    {
      uri: 'http://192.168.1.109:3000/api/upload/music/avelarmanuel/1719165029387-Jimue.mpeg',
      title: 'Louvor'
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
            <Link href={{ pathname: '/video', params: { title: video.caption, uri: video.uri } }}>
              <Text style={styles.caption}>{video.caption}</Text>
            </Link>
          </View>
        ))}

        <Text style={styles.title}>Músicas Populares</Text>
        {musicas.map((audio, index) => (
          <View key={index} style={styles.audioContainer}>
            <Image source={require('@/assets/images/alhilal-logo.jpg')} style={styles.image} />
            <Text style={styles.description}>{audio.title}</Text>
            <View style={styles.controls}>
              <TouchableOpacity onPress={() => seekAudio(index, Math.max(position[index] - 15000, 0))} style={{ marginRight: 10 }}>
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
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  videoContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  video: {
    width: Platform.OS === 'web' ? 700 : '100%',
    height: Platform.OS === 'web' ? 350 : 250,
  },
  audio: {
    width: Platform.OS === 'web' ? 300 : '100%',
    height: Platform.OS === 'web' ? 350 : 250,
  },
  audioContainer: {
    alignItems: 'center',
  },
  caption: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
  },
  description: {
    textAlign: 'center',
    fontSize: 16,
  },
  image: {
    width: Platform.OS === 'web' ? 300 : '100%',
    height: 300,
    marginBottom: 10,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  progressBar: {
    width: '80%',
    height: 40,
  },
  time: {
    textAlign: 'center',
    fontSize: 14,
    marginVertical: 10,
  },
});
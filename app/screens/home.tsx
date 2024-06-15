import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Pressable, Dimensions } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Link } from 'expo-router';
import { Audio } from 'expo-av';
import { FontAwesome } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

type MediaItem = {
  id: number;
  title: string;
  uri: string;
  type?: 'video' | 'song';
};

const HomeScreen = () => {
  const username = "avelarmanuel";
  const filename = "1718462537467-Coldplay.mp4";
  const mostViewedVideos: MediaItem[] = [
    {
      id: 1,
      type: "video",
      title: "Servidor",
      uri: "http://192.168.1.108:3000/upload/video/avelarmanuel/1718462537467-Coldplay.mp4",
    },
    {
      id: 2,
      type: "video",
      title: "Google",
      uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    },
    {
      id: 3,
      type: "video",
      title: "Tears of Steel",
      uri: "http://192.168.1.108:3000/upload/video/avelarmanuel/1718462537467-Coldplay.mp4",
    },
  ];

  const mostListenedSongs: MediaItem[] = [
    {
      id: 1,
      title: "Song One",
      uri: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    },
    {
      id: 2,
      title: "Song Two",
      uri: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    },
    {
      id: 3,
      title: "Song Three",
      uri: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    },
  ];

  const popularMedia: MediaItem[] = [
    {
      id: 1,
      type: "video",
      title: "Popular Video One",
      uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    },
    {
      id: 2,
      type: "song",
      title: "Popular Song One",
      uri: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    },
    {
      id: 3,
      type: "video",
      title: "Popular Video Two",
      uri: `http://192.168.1.108:3000/upload/video/${username}/${filename}`
    },
    {
      id: 4,
      type: "song",
      title: "Popular Song Two",
      uri: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    },
  ];

  const [playingAudio, setPlayingAudio] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioPosition, setAudioPosition] = useState<number>(0);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [showAudioControls, setShowAudioControls] = useState(false);

  const videoRefs = useRef<any[]>([]);

  useEffect(() => {
    return () => {
      playingAudio?.unloadAsync();
    };
  }, [playingAudio]);

  const playAudio = async (uri: string) => {
    if (playingAudio) {
      await playingAudio.unloadAsync();
    }
    const { sound } = await Audio.Sound.createAsync({ uri }, {}, onPlaybackStatusUpdate);
    setPlayingAudio(sound);
    setShowAudioControls(true);
    await sound.playAsync();
    setIsPlaying(true);
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setAudioPosition(status.positionMillis);
      setAudioDuration(status.durationMillis);
      setIsPlaying(status.isPlaying);
    }
  };

  const togglePlayback = async () => {
    if (!playingAudio) return;
    if (isPlaying) {
      await playingAudio.pauseAsync();
    } else {
      await playingAudio.playAsync();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSliderChange = async (value: number) => {
    if (playingAudio) {
      await playingAudio.setPositionAsync(value);
    }
  };

  const pauseAllMedia = async () => {
    if (playingAudio) {
      await playingAudio.pauseAsync();
    }
    videoRefs.current.forEach(async (video) => {
      if (video) {
        await video.pauseAsync();
      }
    });
  };

  const renderMediaItem = ({ item }: { item: MediaItem }) => {
    return (
      <View style={styles.card}>
        {item.type === 'video' || item.uri.endsWith('.mp4') ? (
          <>
            <Link href={{ pathname: '/video', params: { title: item.title, uri: item.uri } }}>
              <Video
                ref={(ref) => { videoRefs.current[item.id] = ref; }}
                source={{ uri: item.uri }}
                rate={1.0}
                volume={1.0}
                isMuted={true}
                resizeMode={ResizeMode.COVER}
                shouldPlay={false}
                useNativeControls
                style={styles.media}
              />
            </Link>
            <Text style={styles.title}>{item.title}</Text>
          </>
        ) : (
          <>
            <Pressable style={styles.audioPlaceholder} onPress={() => playAudio(item.uri)}>
              <FontAwesome name={'play'} size={32} color="black" />
            </Pressable>
            <Text style={styles.title}>{item.title}</Text>
          </>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Vídeos mais visualizados</Text>
      <FlatList
        horizontal
        data={mostViewedVideos}
        renderItem={renderMediaItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.cardsContainer}
        showsHorizontalScrollIndicator={false}
      />

      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Músicas mais ouvidas</Text>
      <FlatList
        horizontal
        data={mostListenedSongs}
        renderItem={renderMediaItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.cardsContainer}
        showsHorizontalScrollIndicator={false}
      />

      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Vídeos e músicas populares</Text>
      <FlatList
        horizontal
        data={popularMedia}
        renderItem={renderMediaItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.cardsContainer}
        showsHorizontalScrollIndicator={false}
      />

      {showAudioControls && (
        <View style={styles.audioControls}>
          <Pressable style={styles.closeButton} onPress={() => setShowAudioControls(false)}>
            <FontAwesome name="times" size={24} color="white" />
          </Pressable>
          <Pressable onPress={togglePlayback} style={styles.playPauseButton}>
            <FontAwesome name={isPlaying ? 'pause' : 'play'} size={32} color="white" />
          </Pressable>
          <Slider
            style={styles.slider}
            value={audioPosition}
            maximumValue={audioDuration}
            onSlidingComplete={handleSliderChange}
            minimumTrackTintColor="#1EB1FC"
            maximumTrackTintColor="#8ED1FC"
            thumbTintColor="#1EB1FC"
          />
          <Text style={styles.timeText}>{Math.floor(audioPosition / 1000)} / {Math.floor(audioDuration / 1000)} sec</Text>
        </View>
      )}
    </View>
  );
};

const { width } = Dimensions.get('window');
const isLargeScreen = width >= 600;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 20,
    paddingHorizontal: isLargeScreen ? 40 : 10,
    justifyContent: isLargeScreen ? "center" : "space-between",
  },
  cardsContainer: {
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
    marginLeft: 10,
  },
  card: {
    marginRight: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    width: isLargeScreen ? 450 : 185,
    height: isLargeScreen ? 320 : 240,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: {
      width: 0,
      height: 1,
    },
  },
  media: {
    width: '100%',
    height: isLargeScreen ? 200 : 150,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  title: {
    fontSize: isLargeScreen ? 18 : 16,
    fontWeight: 'bold',
    padding: 10,
  },
  audioPlaceholder: {
    width: '100%',
    height: isLargeScreen ? 200 : 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ccc',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  audioControls: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#219ebc',
    borderRadius: 8,
    padding: 20,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 10,
  },
  playPauseButton: {
    padding: 10,
  },
  slider: {
    flex: 1,
    marginHorizontal: 10,
  },
  timeText: {
    fontSize: 14,
    color: 'white',
  },
  });
  
  export default HomeScreen;
  

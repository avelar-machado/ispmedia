import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';

type RootStackParamList = {
  VideoScreen: { title: string; uri: string };
};

type VideoScreenRouteProp = RouteProp<RootStackParamList, 'VideoScreen'>;

const VideoScreen = () => {
  const route = useRoute<VideoScreenRouteProp>();
  const { title, uri } = route.params;
  const videoRef = useRef<Video>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      (videoRef.current as any).loadAsync(
        { uri },
        {},
        false
      ).catch((err: unknown) => {
        console.error("Error loading video:", err as Error);
        setError("Error loading video");
      });
    }
  }, [uri]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.title}>{uri} - API</Text>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <Video
          ref={videoRef}
          source={{ uri: uri }}
          rate={1.0}
          volume={1.0}
          isMuted={false}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay
          useNativeControls
          style={styles.video}
          onError={(e) => {
            console.error("Video Error:", e);
            setError("Error playing video");
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 50,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  video: {
    width: '100%',
    height: 300,
  },
  error: {
    color: 'red',
    fontSize: 18,
  },
});

export default VideoScreen;

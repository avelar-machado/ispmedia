import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StatusBar, StyleSheet, ScrollView } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

interface Station {
  freq: string;
  title: string;
  src: string;
}

const stationsData: Station[] = [
  { freq: '99.1', title: "Radio Mais", src: 'https://radios.justweb.pt/8050/stream/?1685627470876' },
  { freq: '88.5', title: "Radio Escola", src: 'https://radios.vpn.sapo.pt/AO/radio1.mp3' },
  { freq: '95.5', title: "Radio Lac", src: 'https://radios.vpn.sapo.pt/AO/radio14.mp3?1685629053605' },
  { freq: '98.4', title: "Radio Kairos", src: 'http://radios.vpn.sapo.pt/AO/radio9.mp3' },
  { freq: '99.9', title: "Radio Luanda", src: 'http://radios.vpn.sapo.pt/AO/radio11.mp3' },
  { freq: '93.5', title: "Radio NA", src: 'http://radios.vpn.sapo.pt/AO/radio3.mp3' },
  { freq: '91', title: "Radio Despertar", src: 'http://radios.vpn.sapo.pt/AO/radio15.mp3' },
  { freq: '97.9', title: "Radio Romantica", src: 'http://radios.vpn.sapo.pt/AO/radio4.mp3' },
  { freq: '94.5', title: "Radio 5", src: 'http://radios.vpn.sapo.pt/AO/radio5.mp3' },
  { freq: '94.7', title: "Antena 1", src: 'https://radiocast.rtp.pt/antena180a.mp3' }, // Portugal
  { freq: '107.5', title: "Triple J", src: 'http://live-radio01.mediahubaustralia.com/2TJW/mp3/' }, // Australia
  { freq: '100.9', title: "KEXP 90.3 FM", src: 'http://live-mp3-128.kexp.org/kexp128.mp3' }, // USA
  { freq: '101.1', title: "SBS PopAsia", src: 'http://live-radio01.mediahubaustralia.com/2TJW/mp3/' }, // Australia
  { freq: '104.3', title: "Radio Paradise", src: 'http://stream-uk1.radioparadise.com/aac-320' }, // Global
  { freq: '94.8', title: "Antena 2", src: 'https://radiocast.rtp.pt/antena280a.mp3' }, // Portugal
  { freq: '105.7', title: "Tuga Fm", src: 'https://stream-172.zeno.fm/sy89zzvs0rquv?zt=eyJhbGciOiJIUzI1NiJ9.eyJzdHJlYW0iOiJzeTg5enp2czBycXV2IiwiaG9zdCI6InN0cmVhbS0xNzIuemVuby5mbSIsInJ0dGwiOjUsImp0aSI6Im8zQUhsb2dpUXVDV0VEaU45Y004SnciLCJpYXQiOjE3MjA1MzIyNjcsImV4cCI6MTcyMDUzMjMyN30.gWmWfYMlmJt-JqUIriF-4_pj59piN1XG2CFBltA763U' }, // Portugal
  { freq: '99.3', title: "Rai Radio 1", src: 'http://icestreaming.rai.it/1.mp3' }, // Italy
  { freq: '94.9', title: "Antena 3", src: 'https://radiocast.rtp.pt/antena380a.mp3' }, // Portugal
  { freq: '106.8', title: "Orbital", src: 'http://centova.radios.pt:9478/stream/1/' }, // Portugal 
  { freq: '102.3', title: "Noite FM", src: 'http://live.noite.pt:8080/;' }, // Portugal
  { freq: '109.7', title: "HIT FM", src: 'https://stream-174.zeno.fm/88ck6ggfqm0uv?zt=eyJhbGciOiJIUzI1NiJ9.eyJzdHJlYW0iOiI4OGNrNmdnZnFtMHV2IiwiaG9zdCI6InN0cmVhbS0xNzQuemVuby5mbSIsInJ0dGwiOjUsImp0aSI6IlVDU0pTZjdhUXNPOThwaS1CMU9taEEiLCJpYXQiOjE3MjA1MzMxMzUsImV4cCI6MTcyMDUzMzE5NX0.X_OTzik_xcdojRsn50OaGF4C2O1VhIYMbMr21j-l6Mc' }, // Portugal 
  { freq: '108.2', title: "Radio Amália", src: 'https://centova.radios.pt/proxy/496?mp=/stream/1/' }, // Portugal
  { freq: '107.8', title: "Marginal", src: 'https://centova.radios.pt/proxy/496?mp=/stream/1/' }, // Portugal
  { freq: '111.2', title: "RDP 1", src: 'https://stream-icy.bauermedia.pt/m8060.aac' }, // Portugal
  { freq: '111.4', title: "RDP 2", src: 'https://stream-icy.bauermedia.pt/m8080.aac' }, // Portugal
  { freq: '105.9', title: "Nove3Cinco", src: 'https://centova.radios.pt/proxy/522?mp=/stream/1/' }, // Portugal
  { freq: '109.9', title: "Mega Hits", src: 'https://22533.live.streamtheworld.com/MEGA_HITS_SC' }, // Portugal
  { freq: '106.7', title: "Comercial", src: 'https://stream-icy.bauermedia.pt/comercial.aac' }, // Portugal
  { freq: '110.3', title: "M80", src: 'https://stream-icy.bauermedia.pt/m80.aac' }, // Portugal
  { freq: '108.5', title: "CidadeFM", src: 'https://stream-icy.bauermedia.pt/cidade.aac' }, // Portugal
];

const Radio: React.FC = () => {
  const [currentStation, setCurrentStation] = useState<number | null>(null);
  const sound = useRef<Audio.Sound | null>(null);

  const play = async (i: number) => {
    const station = stationsData[i];
    if (station.src) {
      if (sound.current) {
        await sound.current.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: station.src });
      sound.current = newSound;
      setCurrentStation(i);
      await sound.current.playAsync();
    }
  };

  const stop = async () => {
    if (sound.current) {
      await sound.current.stopAsync();
      setCurrentStation(null);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
      <StatusBar backgroundColor="#001F3F" barStyle="light-content" />
      <Text style={styles.header}>Rádio ISPMEDIA</Text>
      {stationsData.map((station, i) => (
        <TouchableOpacity
          key={i}
          style={[styles.station, { backgroundColor: currentStation === i ? 'rgba(255, 255, 255, 0.1)' : '' }]}
          onPress={() => {
            if (currentStation === i) {
              stop();
            } else {
              play(i);
            }
          }}
        >
          <View style={styles.title}>
            <Text style={styles.subtitle}><Text style={styles.freq}>{station.freq}</Text> {station.title}</Text>
            {currentStation === i && (
              <View style={styles.liveContainer}>
                <Ionicons name="play-circle" size={24} color="white" style={styles.playIcon} />
                <Text style={styles.live}>LIVE</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
    </ScrollView>
    
  );
};

export default Radio;

const styles = StyleSheet.create({
scrollContainer: {
    flexGrow: 1,
    },
  container: {
    flex: 1,
    backgroundColor: '#219ebc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    color: 'white',
    marginBottom: 20,
  },
  station: {
    padding: 10,
    marginVertical: 5,
    width: '90%',
    borderRadius: 5,
  },
  title: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtitle: {
    color: 'white',
    fontSize: 18,
  },
  freq: {
    fontWeight: 'bold',
  },
  liveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playIcon: {
    marginRight: 5,
  },
  live: {
    color: 'white',
    fontSize: 16,
  },
});

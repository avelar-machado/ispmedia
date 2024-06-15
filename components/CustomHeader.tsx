import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from "../app/context/authcontext";
import ProfileModal from './modal-profile';

type CustomHeaderProps = {
  routeName: string;
};

const CustomHeader: React.FC<CustomHeaderProps> = ({ routeName }) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { logout } = useAuth();
  const [isProfileModalVisible, setProfileModalVisible] = useState(false);

  const handleProfilePress = () => {
    setProfileModalVisible(true);
  };

  const handleProfileModalClose = () => {
    setProfileModalVisible(false);
  };

  const exitPress = () => {
    logout();
    router.push("/");
  };

  return (
    <View style={[styles.header, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <Text style={styles.title}>{routeName}</Text>
      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={handleProfilePress} style={styles.iconButton}>
          <Ionicons name="person-circle-outline" size={30} color="#219ebc" />
        </TouchableOpacity>
        <TouchableOpacity onPress={exitPress} style={styles.iconButton}>
          <Ionicons name="exit-outline" size={30} color="#219ebc" />
        </TouchableOpacity>
      </View>
      <ProfileModal visible={isProfileModalVisible} onClose={handleProfileModalClose} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    marginTop: 30,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#219ebc',
  },
  iconContainer: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});

export default CustomHeader;

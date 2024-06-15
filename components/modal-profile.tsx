import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const { width } = Dimensions.get('window');

type ProfileModalProps = {
  visible: boolean;
  onClose: () => void;
};

const ProfileModal: React.FC<ProfileModalProps> = ({ visible, onClose }) => {
  const colorScheme = useColorScheme();

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Perfil</Text>
          <Text style={styles.modalText}>Nome de usuário: User123</Text>
          <Text style={styles.modalText}>Email: user123@example.com</Text>
          <Text style={styles.modalText}>Outras informações do perfil...</Text>
          <TouchableOpacity onPress={onClose} style={styles.dismissButton}>
            <Text style={styles.dismissButtonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: width * 0.75,
    height: '100%',
    padding: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
  },
  modalText: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 10,
  },
  dismissButton: {
    marginTop: 20,
    backgroundColor: '#EAE45F',
    padding: 10,
    borderRadius: 5,
  },
  dismissButtonText: {
    color: '#000000',
    fontWeight: 'bold',
  },
});

export default ProfileModal;

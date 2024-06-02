import React, { useState } from 'react';
import { useRouter  } from 'expo-router';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
import axios from 'axios';


const RegisterScreen = () => {
    const router = useRouter();
    const [username, setUserName] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async () => {
        try {
            await axios.post('http://192.168.1.108:3000/users', { username, password });
            //navigation.navigate('index');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <View style={styles.container}>
            <Text>Nome de usário:</Text>
            <TextInput style={styles.input} value={username} onChangeText={setUserName} />
            <Text>Senha:</Text>
            <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />
            <Button title="Registrar" onPress={handleRegister} />
            <Button title="Voltar para login" onPress={() => router.push('/')} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 20,
        paddingLeft: 10
    }
});

export default RegisterScreen;

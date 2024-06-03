import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";

const Separator = () => <View style={styles.separator} />;

const LoginScreen = () => {
  const router = useRouter();
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Nome de usuário e Senha são requisitados.");
      return;
    }

    try {
      const res = await axios.post("http://192.168.1.108:3000/users/login", {
        username,
        password,
      });
      console.info(res.data.createdAt);
      alert("Bem-vindo(a) ao ISPMEDIA "+ res.data.username);
      setError(''); // Limpa qualquer erro anterior após o sucesso
      // Navegar para a próxima tela
    } catch (err) {
      setError("Erro ao fazer login. Tente novamente.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.logoText}>Bem-vindo(a) ao ISPMEDIA</Text>
      <View style={styles.inputs}>
        <Text style={styles.text}>Nome de usário:</Text>
        <TextInput 
            style={styles.input} 
            value={username}
            placeholder="Escreva o seu nome de usuário aqui..."
            placeholderTextColor={"black"}
            onChangeText={setUserName} 
        />
        <Text style={styles.text}>Senha:</Text>
        <TextInput
            style={styles.input}
            value={password}
            placeholder="Escreva a sua senha aqui..."
            placeholderTextColor={"black"}
            onChangeText={setPassword}
            secureTextEntry
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
      <View style={styles.buttonContainer}>
        <View style={[styles.button, {backgroundColor: "#80ed99"}]}>
          <Button title="Entrar" onPress={handleLogin} color={"#000000"} />
        </View>
        <Separator />
        <View style={styles.button}>
          <Button
            title="Registrar"
            onPress={() => router.push("/register")}
            color={"#000000"}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#161515",
  },
  inputs: {
    padding: 35,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    backgroundColor: "white",
    borderRadius: 5,
  },
  separator: {
    height: 2,
    marginVertical: 8,
    borderBottomColor: "#000000",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  button: {
    backgroundColor: "#EAE45F",
    padding: 10,
    borderRadius: 25,
    width: 110,
  },
  buttonContainer: {
    width: "94%",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "white",
    fontSize: 20,
    fontWeight: "condensed",
    fontFamily: "Monda-Regular",
  },
  logoText: {
    color: "white",
    fontSize: 30,
    textAlign: "center",
    marginBottom: 35,
  },
  error: {
    color: "red",
    marginBottom: 20,
    textAlign: "center",
    fontSize: 16,
  },
});

export default LoginScreen;

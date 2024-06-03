import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Text,
  SafeAreaView,
} from "react-native";
import axios from "axios";

const Separator = () => <View style={styles.separator} />;

const RegisterScreen = () => {
  const router = useRouter();
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!username || !password) {
      setError("Nome de usuário e Senha são requisitados.");
      return;
    }

    try {
      const response = await axios.post('http://192.168.1.108:3000/users', { username, password });
      console.log(response.data);
      // navigation.navigate('index'); // descomente se estiver usando o react-navigation
      setError(""); // Limpa qualquer erro anterior após o sucesso
      alert ("Registo ao ISPMEDIA feito com Sucesso.");
      router.push("/");
    } catch (err) {
      setError("Erro ao Registar. Tente novamente.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.logoText}>Crie uma conta no ISPMEDIA</Text>
      <View style={styles.inputs}>
        <Text style={styles.text}>Nome de usuário:</Text>
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
          <Button title="Registrar" onPress={handleRegister} color={"#000000"} />
        </View>
        <Separator />
        <View style={styles.button}>
          <Button
            title="Entrar"
            onPress={() => router.push("/")}
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
    fontSize: 16,
    textAlign: "center",
  },
});

export default RegisterScreen;

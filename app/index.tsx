import React, { useState } from "react";
import { View, TextInput, StyleSheet, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "./context/authcontext";
import * as Animatable from "react-native-animatable";

const Separator = () => <View style={styles.separator} />;

const LoginScreen = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Nome de usuário e Senha são requisitados.");
      return;
    }

    try {
      const res = await axios.post("http://192.168.1.109:3000/users/login", {
        username,
        password,
      });
      login(res.data.token);
      alert("Bem-vindo(a) ao ISPMEDIA " + res.data.username);
      setError(''); // Limpa qualquer erro anterior após o sucesso
      router.push("/screens");
    } catch (err) {
      setError("Erro ao fazer login. Tente novamente.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animatable.Text animation="fadeIn" style={styles.logoText}>
        Bem-vindo(a) ao ISPMEDIA
      </Animatable.Text>
      <View style={styles.inputs}>
        <Text style={styles.text}>Nome de usuário:</Text>
        <Animatable.View animation="fadeInUp">
          <TextInput 
            style={[
              styles.input, 
              focusedInput === "username" && styles.focusedInput
            ]}
            value={username}
            placeholder="Escreva o seu nome de usuário aqui..."
            placeholderTextColor={"gray"}
            onChangeText={setUserName} 
            onFocus={() => setFocusedInput("username")}
            onBlur={() => setFocusedInput(null)}
          />
        </Animatable.View>
        <Text style={styles.text}>Senha:</Text>
        <Animatable.View animation="fadeInUp">
          <TextInput
            style={[
              styles.input, 
              focusedInput === "password" && styles.focusedInput
            ]}
            value={password}
            placeholder="Escreva a sua senha aqui..."
            placeholderTextColor={"gray"}
            onChangeText={setPassword}
            secureTextEntry
            onFocus={() => setFocusedInput("password")}
            onBlur={() => setFocusedInput(null)}
          />
        </Animatable.View>
        {error ? (
          <Animatable.Text animation="shake" style={styles.error}>
            {error}
          </Animatable.Text>
        ) : null}
      </View>
      <View style={styles.buttonContainer}>
        <Pressable onPress={handleLogin}>
          <Animatable.View 
            animation="pulse" 
            iterationCount="infinite" 
            style={[styles.button, {backgroundColor: "#80ed99"}]}
          >
            <Text style={styles.buttonText}>Entrar</Text>
          </Animatable.View>
        </Pressable>
        <Separator />
        <Pressable onPress={() => router.push("/register")}>
          <View style={styles.button}>
            <Text style={styles.buttonText}>Registrar</Text>
          </View>
        </Pressable>
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
    paddingLeft: 10,
  },
  focusedInput: {
    borderColor: "#80ed99",
    borderWidth: 2,
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
    alignItems: "center",
  },
  buttonContainer: {
    width: "94%",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#000000",
    fontWeight: "bold",
  },
  text: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
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
    fontWeight: "bold",
    backgroundColor: "rgba(255, 0, 0, 0.1)",
    padding: 10,
    borderRadius: 5,
  },
});

export default LoginScreen;

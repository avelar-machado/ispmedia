import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import * as Animatable from "react-native-animatable";

const Separator = () => <View style={styles.separator} />;

const RegisterScreen = () => {
  const router = useRouter();
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!username || !password || !nome || !email) {
      setError("Todos dados são requisitados.");
      return;
    }

    try {
      const response = await axios.post('http://192.168.1.108:3000/users', { username, nome, email, password });
      console.log(response.data);
      setError(""); // Limpa qualquer erro anterior após o sucesso
      alert("Registo ao ISPMEDIA feito com Sucesso.");
      router.push("/");
    } catch (err) {
      setError("Erro ao Registar. Tente novamente.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animatable.Text animation="fadeIn" style={styles.logoText}>
        Crie uma conta no ISPMEDIA
      </Animatable.Text>
      <View style={styles.inputs}>
        <Text style={styles.text}>Nome de usuário:</Text>
        <Animatable.View animation="fadeInDown">
          <TextInput
            style={[
              styles.input,
              focusedInput === "username" && styles.focusedInput,
            ]}
            value={username}
            placeholder="Escreva o seu nome de usuário aqui..."
            placeholderTextColor={"gray"}
            onChangeText={setUserName}
            onFocus={() => setFocusedInput("username")}
            onBlur={() => setFocusedInput(null)}
          />
        </Animatable.View>
        <Text style={styles.text}>Nome completo:</Text>
        <Animatable.View animation="fadeInDown">
          <TextInput
            style={[
              styles.input,
              focusedInput === "nome" && styles.focusedInput,
            ]}
            value={nome}
            placeholder="Escreva o seu nome completo aqui..."
            placeholderTextColor={"gray"}
            onChangeText={setName}
            onFocus={() => setFocusedInput("nome")}
            onBlur={() => setFocusedInput(null)}
          />
        </Animatable.View>
        <Text style={styles.text}>Email:</Text>
        <Animatable.View animation="fadeInDown">
          <TextInput
            style={[
              styles.input,
              focusedInput === "email" && styles.focusedInput,
            ]}
            value={email}
            placeholder="Escreva o seu email aqui..."
            placeholderTextColor={"gray"}
            onChangeText={setEmail}
            onFocus={() => setFocusedInput("email")}
            onBlur={() => setFocusedInput(null)}
          />
        </Animatable.View>
        <Text style={styles.text}>Senha:</Text>
        <Animatable.View animation="fadeInDown">
          <TextInput
            style={[
              styles.input,
              focusedInput === "password" && styles.focusedInput,
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
        <TouchableOpacity onPress={handleRegister}>
          <Animatable.View
            animation="pulse"
            iterationCount="infinite"
            style={[styles.button, { backgroundColor: "#80ed99" }]}
          >
            <Text style={styles.buttonText}>Registrar</Text>
          </Animatable.View>
        </TouchableOpacity>
        <Separator />
        <TouchableOpacity onPress={() => router.push("/")}>
          <View style={styles.button}>
            <Text style={styles.buttonText}>Entrar</Text>
          </View>
        </TouchableOpacity>
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
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
    backgroundColor: "rgba(255, 0, 0, 0.1)",
    padding: 10,
    borderRadius: 5,
  },
});

export default RegisterScreen;

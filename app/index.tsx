import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";

const Separator = () => <View style={styles.separator} />;

const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });
      // Navegar para a próxima tela
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={styles.logoText}>ISPMEDIA</Text>
      </View>
      <Text style={styles.text}>Email:</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} />
      <Text style={styles.text}>Senha:</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <View style={styles.buttonContainer}>
        <View style={styles.button}>
          <Button title="Login" onPress={handleLogin} color={"#000000"} />
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
    padding: 20,
    backgroundColor: "#161515",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
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
});

export default LoginScreen;

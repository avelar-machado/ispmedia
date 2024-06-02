import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Text,
  SafeAreaView,
  GestureResponderEvent,
} from "react-native";
import axios from "axios";

const Separator = () => <View style={styles.separator} />;

const RegisterScreen = () => {
  const router = useRouter();
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      await axios.post("http://192.168.100.6:3000/users", {
        username,
        password,
      });
      //navigation.navigate('index');
    } catch (err) {
      console.error(err);
    }
  };

  function handleLogin(event: GestureResponderEvent): void {
    throw new Error("Function not implemented.");
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Nome de usário:</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUserName}
      />
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
});

export default RegisterScreen;

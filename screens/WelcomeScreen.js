import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, Touchable, View } from "react-native";
import { AuthContext } from "../store/auth-context";
import { Colors } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import { fetchUserData } from "../util/http";
import { UserContext } from "../store/user-context";

function WelcomeScreen() {
  const authCtx = useContext(AuthContext);
  const userCtx = useContext(UserContext);

  const token = authCtx.token;
  const email = authCtx.email;

  useEffect(() => {
    async function LoadUser() {
      const userData = await fetchUserData(email, token);
      userCtx.setUser(userData);

      console.log(userCtx);
      return await fetchUserData();
    }
    LoadUser();
  }, [token]);

  return (
    <View style={styles.rootContainer}>
      <View style={styles.containers}>
        <Ionicons name="camera-outline" size={75} color="white" />
        <Text style={styles.text}>Take photo</Text>
      </View>
      <View style={styles.containers}>
        <Ionicons name="images-outline" size={75} color="white" />
        <Text style={styles.text}>Choose from gallery</Text>
      </View>
    </View>
  );
}

export default WelcomeScreen;

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  containers: {
    flex: 1,
    backgroundColor: Colors.primary500,
    width: "100%",
    margin: 36,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 26,
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    color: "white",
  },
});

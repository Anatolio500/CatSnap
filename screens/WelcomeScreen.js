import { useContext, useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { launchCameraAsync } from "expo-image-picker";
import { launchImageLibraryAsync } from "expo-image-picker";
import Ionicons from "react-native-vector-icons/Ionicons";

import { Colors } from "../constants/styles";
import { fetchUserData } from "../util/http";
import { UserContext } from "../store/user-context";
import { AuthContext } from "../store/auth-context";

function WelcomeScreen() {
  const authCtx = useContext(AuthContext);
  const userCtx = useContext(UserContext);

  const token = authCtx.token;
  const email = authCtx.email;

  useEffect(() => {
    async function LoadUser() {
      const userData = await fetchUserData(email, token);
      userCtx.setUser(userData);

      return await fetchUserData();
    }
    LoadUser();
  }, [token]);

  async function ImagePickerCamera() {
    const image = await launchCameraAsync();
    console.log(image);
  }

  return (
    <View style={styles.rootContainer}>
      <Pressable
        style={({ pressed }) => [
          styles.containers,
          pressed ? styles.buttonPressed : null,
        ]}
        onPress={ImagePickerCamera}
      >
        <Ionicons name="camera-outline" size={75} color="white" />
        <Text style={styles.text}>Take photo</Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => [
          styles.containers,
          pressed ? styles.buttonPressed : null,
        ]}
      >
        <Ionicons name="images-outline" size={75} color="white" />
        <Text style={styles.text}>Choose from gallery</Text>
      </Pressable>
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
  button: { flex: 1 },
  buttonPressed: {
    opacity: 0.5,
  },
});

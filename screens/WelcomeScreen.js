import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, Touchable, View } from "react-native";
import { AuthContext } from "../store/auth-context";
import { Colors } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";

function WelcomeScreen() {
  // const [fetchedMessage, setFetchedMessage] = useState("");

  const authCtx = useContext(AuthContext);
  const token = authCtx.token;

  // useEffect(() => {
  //   axios
  //     .get(
  //       "https://authentication-daf7d-default-rtdb.europe-west1.firebasedatabase.app/message.json?auth=" +
  //         token
  //     )
  //     .then((response) => {
  //       setFetchedMessage(response.data);
  //     });
  // }, [token]);

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

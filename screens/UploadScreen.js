import { useContext, useEffect, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { firebase } from "../firebaseConfig";
import axios from "axios";

import { Colors } from "../constants/styles";
import { fetchUserData } from "../util/http";
import { UserContext } from "../store/user-context";
import { AuthContext } from "../store/auth-context";
import { TouchableOpacity } from "react-native";
import LoadingOverlay from "../components/ui/LoadingOverlay";
import UploadImage from "../components/Upload/UploadImage";

function UploadScreen() {
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

  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takeImage = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    setUploading(true);

    try {
      const { uri } = await FileSystem.getInfoAsync(image);
      // const blob = await new Promise((resolve, reject) => {
      //   const xhr = new XMLHttpRequest();
      //   xhr.onload = () => {
      //     resolve(xhr.response);
      //   };
      //   xhr.onerror = (e) => {
      //     reject(new TypeError("Network request failed"));
      //   };
      //   xhr.responseType = "blob";
      //   xhr.open("GET", uri, true);
      //   xhr.send(null);
      // });

      const response = await axios.get(uri, { responseType: "blob" });
      const blob = response.data;

      const filename = image.substring(image.lastIndexOf("/") + 1);
      const ref = firebase.storage().ref().child(filename);

      await ref.put(blob);

      const dowloadUrl = await ref.getDownloadURL();
      console.log("File is available at: ", dowloadUrl);

      setUploading(false);
      Alert.alert("Photo uploaded");
      setImage(null);
    } catch (error) {
      console.error(error);
      setUploading(false);
    }
  };

  function cancelUpload() {
    setImage(null);
  }

  if (uploading) {
    return <LoadingOverlay message={"Uploading image"} />;
  }

  if (image !== null) {
    return (
      <View style={styles.rootContainer}>
        <View style={styles.uploadContainer}>
          <Image source={{ uri: image }} style={{ width: 300, height: 300 }} />
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={cancelUpload}
          >
            <Ionicons name="close-circle-outline" size={20} color="white" />
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.uploadButton]}
            onPress={uploadImage}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={20}
              color="white"
              style={styles.icons}
            />
            <Text style={styles.buttonText}>Upload</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.rootContainer}>
      <Pressable
        style={({ pressed }) => [
          styles.containers,
          pressed ? styles.buttonPressed : null,
        ]}
        onPress={takeImage}
      >
        <Ionicons name="camera-outline" size={75} color="white" />
        <Text style={styles.text}>Take photo</Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => [
          styles.containers,
          pressed ? styles.buttonPressed : null,
        ]}
        onPress={pickImage}
      >
        <Ionicons name="images-outline" size={75} color="white" />
        <Text style={styles.text}>Choose from gallery</Text>
      </Pressable>
    </View>
  );
}

export default UploadScreen;

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
  uploadContainer: {
    marginBottom: 16,
    marginHorizontal: 32,
    padding: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary500,
    elevation: 2,
    shadowColor: "black",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    flex: 1 / 2,
    flexDirection: "row",
    marginTop: 16,
    marginHorizontal: 10,
    width: 100,
    height: 35,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: "red",
  },
  uploadButton: {
    backgroundColor: "green",
  },
  buttonPressed: {
    opacity: 0.5,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  icons: {
    marginHorizontal: 4,
  },
});

import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useState, useContext, useCallback } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { firebase } from "../firebaseConfig";
import { TouchableOpacity } from "react-native";
import axios from "axios";

import LoadingOverlay from "../components/ui/LoadingOverlay";
import { Colors } from "../constants/styles";
import {
  createHistoryData,
  createValidationImage,
  fetchUserData,
} from "../util/http";
import { AuthContext } from "../store/auth-context";
import { UserContext } from "../store/user-context";

function UploadScreen() {
  const navigation = useNavigation();
  const authCtx = useContext(AuthContext);
  const userCtx = useContext(UserContext);

  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const loadingData = async () => {
        const data = await fetchUserData(authCtx.email, authCtx.token);
        userCtx.setUser(data);
      };

      loadingData();
    }, [authCtx.email, authCtx.token])
  );

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
      // First, send the image to the Flask backend for prediction
      const formData = new FormData();

      formData.append("image", {
        uri: image,
        type: "image/jpeg", // Adjust the type if needed
        name: "photo.jpg", // You can give any name
      });

      // Replace with your Flask server's IP address and port
      const serverUrl = "http://192.168.0.106:5000/predict"; // Update this with your server's IP

      // Send the image to your Flask backend
      const response = await axios.post(serverUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Handle the prediction response
      console.log("Response from server:", response.data);

      // Extract the top 5 predictions
      const top5 = response.data.top_5;
      setPrediction({
        classLabel: response.data.class_label,
        top5: top5,
      });

      console.log("Prediction:", prediction);

      // Then, upload the image to Firebase Storage
      // Convert the image URI to a blob
      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          resolve(xhr.response);
        };
        xhr.onerror = function (e) {
          console.error(e);
          reject(new TypeError("Network request failed"));
        };
        xhr.responseType = "blob";
        xhr.open("GET", image, true);
        xhr.send(null);
      });

      const filename = image.substring(image.lastIndexOf("/") + 1);
      const historyRef = firebase.storage().ref().child(`history/${filename}`);

      await historyRef.put(blob);

      const validationRef = firebase
        .storage()
        .ref()
        .child(`validation/${filename}`);

      await validationRef.put(blob);

      // We're done with the blob, close and release it
      blob.close();

      const historyDownloadUrl = await historyRef.getDownloadURL();
      console.log("File is available history at:", historyDownloadUrl);

      const validationDownloadUrl = await validationRef.getDownloadURL();
      console.log("File is available validation at:", validationDownloadUrl);

      const dataId = await createHistoryData(
        {
          email: userCtx.email,
          imageUrl: historyDownloadUrl,
          predictedBreed: response.data.class_label,
          topPredictions: response.data.top_5,
        },
        authCtx.token
      );

      setUploading(false);
      Alert.alert("Success", "Photo uploaded and prediction received.");
      setImage(null);
      navigation.navigate("Upload result", {
        dataId: dataId,
        uploaded: true,
        validationDownloadUrl: validationDownloadUrl,
      });
    } catch (error) {
      console.error("Error:", error);
      setUploading(false);
      Alert.alert("Error", "There was an error processing your image.");
    }
  };

  function cancelUpload() {
    setImage(null);
  }

  if (loading) {
    return <LoadingOverlay message={"Loading..."} />;
  }

  if (uploading) {
    return <LoadingOverlay message={"Processing image..."} />;
  }

  return (
    <View style={styles.rootContainer}>
      {image !== null ? (
        <>
          <View style={styles.uploadContainer}>
            <Image
              source={{ uri: image }}
              style={{ width: 300, height: 200 }}
            />
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
        </>
      ) : (
        <>
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
        </>
      )}
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
  predictionContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: Colors.primary500,
    borderRadius: 8,
  },
  predictionText: {
    fontSize: 18,
    color: "white",
    textAlign: "center",
  },
});

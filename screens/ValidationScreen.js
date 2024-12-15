import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useContext, useEffect, useState } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import axios from "axios";

import { deleteValidationImage, fetchValidationImage } from "../util/http";
import { AuthContext } from "../store/auth-context";
import { Colors } from "../constants/styles";
import LoadingOverlay from "../components/ui/LoadingOverlay";
import ValidationInput from "../components/Validation/ValidationInput";

import { firebase } from "../firebaseConfig";

function ValidationScreen({ route }) {
  const authCtx = useContext(AuthContext);

  const validationId = route.params.validationId;
  const navigation = useNavigation();

  const [imageUrl, setImageUrl] = useState();
  const [email, setEmail] = useState();
  const [predictedBreed, setPredictedBreed] = useState("ASD");

  const [loading, setLoading] = useState(true);

  function handleArrowPress() {
    navigation.navigate("Validation list");
  }

  useEffect(() => {
    console.log("useEffect Called");
    async function LoadData() {
      try {
        const data = await fetchValidationImage(validationId, authCtx.token);
        setImageUrl(data.imageUrl);
        setEmail(data.email);
        console.log("PredictedBreed: ", predictedBreed);
        setPredictedBreed(data.prediction);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }

    LoadData();
  }, [validationId, authCtx.token]);

  const handleInputChange = (value) => {
    setPredictedBreed(value);
  };

  function getFileNameFromURL(url) {
    try {
      const decodedURL = decodeURIComponent(url);
      const matches = decodedURL.match(/\/o\/(.+)\?alt=media/);
      if (matches && matches[1]) {
        const fullPath = matches[1];
        const fileName = fullPath.substring(fullPath.lastIndexOf("/") + 1);
        return fileName;
      }
    } catch (error) {
      console.error("Invalid URL:", error);
    }
    return null;
  }

  async function moveImage(fileName) {
    const storageRef = firebase.storage().ref();
    const oldRef = storageRef.child(`validation/${fileName}`);
    const newRef = storageRef.child(`Breeds/${predictedBreed}/${fileName}`);

    const downloadURL = await oldRef.getDownloadURL();

    const response = await fetch(downloadURL);
    const blob = await response.blob();

    await newRef.put(blob);

    await oldRef.delete();
  }

  const handleValidate = async () => {
    try {
      if (!predictedBreed) {
        Alert.alert("Validation Error", "Please enter a predicted breed.");
        return;
      }

      const fileName = getFileNameFromURL(imageUrl);
      if (!fileName) {
        throw new Error("Could not extract filename from the image URL.");
      }

      await moveImage(fileName);
      await deleteValidationImage(validationId, authCtx.token);

      const folderPath = `Breeds/${predictedBreed}`;
      const imageCount = await countImagesInFolder(folderPath);

      if (imageCount === 200) {
        sendPredictedBreedToServer(predictedBreed);
      }

      Alert.alert("Success", "Image validated and moved successfully!");
      navigation.navigate("Validation list");
    } catch (error) {
      console.error("Error during the validate operation:", error);
      Alert.alert("Error", "An error occurred while validating the image.");
    }
  };

  const handleDelete = async () => {
    try {
      const fileName = getFileNameFromURL(imageUrl);
      if (!fileName) {
        throw new Error("Could not extract filename from the image URL.");
      }

      const storageRef = firebase.storage().ref();
      const imageRef = storageRef.child(`validation/${fileName}`);

      await imageRef.delete();
      await deleteValidationImage(validationId, authCtx.token);

      Alert.alert("Success", "Image deleted successfully!");
      navigation.navigate("Validation list");
    } catch (error) {
      console.error("Error during the delete operation:", error);
      Alert.alert("Error", "An error occurred while deleting the image.");
    }
  };

  const countImagesInFolder = async (folderPath) => {
    try {
      const storageRef = firebase.storage().ref();
      const listRef = storageRef.child(folderPath);

      const res = await listRef.listAll();

      const itemCount = res.items.length;

      console.log(`Number of images in ${folderPath}: ${itemCount}`);

      return itemCount;
    } catch (error) {
      console.error("Error listing items in folder:", error);
      throw error;
    }
  };

  const sendPredictedBreedToServer = async (predictedBreed) => {
    try {
      const response = await axios.post("http://192.168.0.104:5001/retrain", {
        predictedBreed: predictedBreed,
      });
      console.log(response.data.message);
    } catch (error) {
      if (error.response) {
        console.error(
          "Server error:",
          error.response.status,
          error.response.data
        );
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error setting up request:", error.message);
      }
    }
  };

  if (loading) {
    return <LoadingOverlay message={"Loading data"} />;
  }

  return (
    <View>
      <View>
        <TouchableOpacity onPress={handleArrowPress}>
          <Ionicons name="arrow-back-outline" size={35} color="black" />
        </TouchableOpacity>
      </View>
      <View style={styles.dataContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
        <View>
          <ValidationInput
            label="Sent by"
            editable={false}
            keyboardType="email-address"
            onChangeText={null}
            value={email}
          />
          <ValidationInput
            label="Tag"
            editable={true}
            keyboardType="default"
            onUpdateValue={handleInputChange}
            value={predictedBreed}
          />
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleDelete}
          >
            <Ionicons name="close-circle-outline" size={20} color="white" />
            <Text>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.validateButton]}
            onPress={handleValidate}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="white" />
            <Text>Validate</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default ValidationScreen;

const styles = StyleSheet.create({
  dataContainer: {
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
  image: {
    width: 300,
    height: 200,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
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
  validateButton: {
    backgroundColor: "green",
  },
});

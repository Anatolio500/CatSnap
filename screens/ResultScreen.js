import {
  View,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useContext, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import PieChart from "react-native-pie-chart";
import Ionicons from "react-native-vector-icons/Ionicons";

import { Colors } from "../constants/styles";
import { AuthContext } from "../store/auth-context";
import { createValidationImage, fetchHistoryData } from "../util/http";
import { updateHistoryData } from "../util/http";
import { UserContext } from "../store/user-context";

function ResultScreen({ route }) {
  const dataId = route.params.dataId;
  const uploaded = route.params.uploaded;
  const validationDownloadUrl = route.params.validationDownloadUrl;

  const navigation = useNavigation();
  const authCtx = useContext(AuthContext);
  const userCtx = useContext(UserContext);

  const [imageUrl, setImageUrl] = useState();
  const [predictedBreed, setPredictedBreed] = useState();
  const [predictionCorrect, setPredictionCorrect] = useState(null);
  const [classLabels, setClassLabels] = useState([]);
  const [probabilities, setProbabilities] = useState([20, 20, 20, 20, 20]);
  const [loading, setLoading] = useState(false);

  const widthAndHeight = 170;
  const sliceColor = ["#A8D5BA", "#F9D56E", "#B3E5FC", "#FFC07F", "#F8BBD0"];

  useEffect(() => {
    async function LoadData() {
      setLoading(true);
      const data = await fetchHistoryData(dataId, authCtx.token);
      setImageUrl(data.imageUrl);
      setPredictedBreed(data.predictedBreed);
      setPredictionCorrect(data.predictionCorrect);

      const labels = data.topPredictions.map((item) => item.class_label);
      const probs = data.topPredictions.map((item) =>
        (item.probability * 100).toFixed(2)
      );

      setClassLabels(labels);
      setProbabilities(probs);
      setLoading(false);
    }

    LoadData();
  }, [dataId, authCtx.token]);

  function handleArrowPress() {
    uploaded
      ? navigation.navigate("Upload image")
      : navigation.navigate("History data");
  }

  const handleYesPress = async () => {
    const data = { predictionCorrect: true };
    await updateHistoryData(dataId, authCtx.token, data);

    const valdata = {
      email: userCtx.email,
      imageUrl: validationDownloadUrl,
      prediction: predictedBreed,
    };
    await createValidationImage(valdata, authCtx.token);
    setPredictionCorrect(true);
  };

  const handleNoPress = async () => {
    const data = { predictionCorrect: false };
    await updateHistoryData(dataId, authCtx.token, data);

    const valdata = {
      email: userCtx.email,
      imageUrl: validationDownloadUrl,
      prediction: "",
    };
    await createValidationImage(valdata, authCtx.token);
    setPredictionCorrect(false);
  };

  return (
    <View style={styles.rootContainer}>
      <ScrollView>
        <View>
          <TouchableOpacity onPress={handleArrowPress}>
            <Ionicons name="arrow-back-outline" size={35} color="black" />
          </TouchableOpacity>
        </View>
        <View style={styles.dataContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={{ width: 300, height: 200 }}
          />
          <Text style={styles.Text}>
            The predicted breed is: {predictedBreed}
          </Text>
        </View>
        <View style={styles.dataContainer}>
          <PieChart
            widthAndHeight={widthAndHeight}
            series={probabilities}
            sliceColor={sliceColor}
          />
          <View style={styles.legendContainer}>
            <View style={styles.row}>
              <View style={styles.legendItem}>
                <View
                  style={[styles.colorBox, { backgroundColor: sliceColor[0] }]}
                />
                <Text style={styles.label}>
                  {classLabels[0]}: {probabilities[0]}%
                </Text>
              </View>
            </View>
            <View style={styles.row}>
              {classLabels.slice(1, 3).map((label, index) => (
                <View key={index + 1} style={styles.legendItem}>
                  <View
                    style={[
                      styles.colorBox,
                      { backgroundColor: sliceColor[index + 1] },
                    ]}
                  />
                  <Text style={styles.label}>
                    {label}: {probabilities[index + 1]}%
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.row}>
              {classLabels.slice(3).map((label, index) => (
                <View key={index + 3} style={styles.legendItem}>
                  <View
                    style={[
                      styles.colorBox,
                      { backgroundColor: sliceColor[index + 3] },
                    ]}
                  />
                  <Text style={styles.label}>
                    {label}: {probabilities[index + 3]}%
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {predictionCorrect === undefined ? (
          <View style={styles.dataContainer}>
            <Text style={styles.Text}>Are you satisfied with the result?</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.noButton]}
                onPress={handleNoPress}
              >
                <Ionicons name="close-circle-outline" size={20} color="white" />
                <Text style={styles.Text}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.yesButton]}
                onPress={handleYesPress}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="white"
                  style={styles.icons}
                />
                <Text style={styles.Text}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.dataContainer}>
            <Text style={styles.Text}>Thank you, for your feedback!</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

export default ResultScreen;

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  dataContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    marginHorizontal: 16,
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
  Text: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  icons: {
    marginHorizontal: 4,
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
  noButton: {
    backgroundColor: "red",
  },
  yesButton: {
    backgroundColor: "green",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  legendContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
  },
  colorBox: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  label: {
    fontSize: 16,
  },
});

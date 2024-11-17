import { View, TouchableOpacity, Text, Image, StyleSheet } from "react-native";
import { useContext, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";

import { Colors } from "../constants/styles";
import { AuthContext } from "../store/auth-context";
import { fetchHistoryData } from "../util/http";

function ResultScreen({ route }) {
  const dataId = route.params.dataId;
  const uploaded = route.params.uploaded;

  const navigation = useNavigation();
  const authCtx = useContext(AuthContext);

  const [imageUrl, setImageUrl] = useState();
  const [predictedBreed, setPredictedBreed] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function LoadData() {
      setLoading(true);
      const data = await fetchHistoryData(dataId, authCtx.token);
      setImageUrl(data.imageUrl);
      setPredictedBreed(data.predictedBreed);
      setLoading(false);
    }

    LoadData();
  }, [dataId]);

  function handleArrowPress() {
    uploaded
      ? navigation.navigate("Upload image")
      : navigation.navigate("History data");
  }

  useEffect(() => {}, []);

  return (
    <View style={styles.rootContainer}>
      <View>
        <TouchableOpacity onPress={handleArrowPress}>
          <Ionicons name="arrow-back-outline" size={35} color="black" />
        </TouchableOpacity>
      </View>
      <View style={styles.dataContainer}>
        <Image source={{ uri: imageUrl }} style={{ width: 300, height: 200 }} />
        <Text>{predictedBreed}</Text>
      </View>
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
});

import { Pressable, StyleSheet, Text, View, Image } from "react-native";
import { Colors } from "../../constants/styles";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

function HistoryItem({ id, imageUrl, predictedBreed, predictionCorrect }) {
  const navigation = useNavigation();

  function handlePress() {
    navigation.navigate("History result", { dataId: id, uploaded: false });
  }

  function PredictionCorrectIcon() {
    if (predictionCorrect) {
      return (
        <Ionicons
          name="checkmark-outline"
          style={{ color: "green" }}
          size={40}
        />
      );
    } else {
      return (
        <Ionicons name="close-outline" style={{ color: "red" }} size={40} />
      );
    }
  }

  console.log(predictionCorrect);
  console.log(predictionCorrect !== null);

  return (
    <View style={styles.historyItem}>
      <Pressable
        style={({ pressed }) => (pressed ? styles.buttonPressed : null)}
        onPress={handlePress}
      >
        <View>
          <Image source={{ uri: imageUrl }} style={styles.image} />
          <View style={styles.textContainer}>
            <Text style={styles.title}>{predictedBreed}</Text>
            {predictionCorrect !== undefined ? <PredictionCorrectIcon /> : null}
          </View>
        </View>
      </Pressable>
    </View>
  );
}

export default HistoryItem;

const styles = StyleSheet.create({
  historyItem: {
    margin: 16,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: Colors.primary800,
    elevation: 4,
  },
  buttonPressed: {
    opacity: 0.5,
  },
  innerContainer: {
    borderRadius: 8,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 200,
  },
  title: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 18,
    margin: 8,
  },
  textContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});
